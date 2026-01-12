'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Trash2, MessageSquare, Loader2 } from 'lucide-react';
import { Button, Input } from '@/components/ui';

interface Comment {
    _id: string;
    user: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    message: string;
    attachments?: string[];
    createdAt: string;
}

interface TicketCommentsProps {
    ticketId: string;
}

export default function TicketComments({ ticketId }: TicketCommentsProps) {
    const { data: session } = useSession();
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');

    const userId = (session?.user as any)?.id;
    const userRole = (session?.user as any)?.role;

    useEffect(() => {
        fetchComments();
    }, [ticketId]);

    const fetchComments = async () => {
        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments`);
            if (res.ok) {
                const data = await res.json();
                setComments(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setSubmitting(true);
        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: message.trim() }),
            });

            if (res.ok) {
                const newComment = await res.json();
                setComments([...comments, newComment]);
                setMessage('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const res = await fetch(`/api/tickets/${ticketId}/comments?commentId=${commentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setComments(comments.filter(c => c._id !== commentId));
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-red-500';
            case 'supervisor': return 'bg-purple-500';
            case 'engineer': return 'bg-blue-500';
            default: return 'bg-green-500';
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 text-dark-700 dark:text-dark-300">
                <MessageSquare size={20} />
                <h3 className="font-semibold">Comments ({comments.length})</h3>
            </div>

            {/* Comment List */}
            <div className="space-y-4 max-h-96 overflow-y-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                    </div>
                ) : comments.length === 0 ? (
                    <div className="text-center py-8 text-dark-400">
                        <MessageSquare className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No comments yet. Be the first to comment!</p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment._id}
                            className="flex gap-3 p-4 rounded-xl bg-dark-50 dark:bg-dark-800/50"
                        >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full ${getRoleColor(comment.user?.role)} flex items-center justify-center text-white font-bold shrink-0`}>
                                {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium text-dark-900 dark:text-white">
                                            {comment.user?.name || 'Unknown'}
                                        </span>
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-dark-200 dark:bg-dark-700 text-dark-500 capitalize">
                                            {comment.user?.role || 'user'}
                                        </span>
                                    </div>
                                    {(comment.user?._id === userId || userRole === 'admin') && (
                                        <button
                                            onClick={() => handleDelete(comment._id)}
                                            className="p-1 rounded-lg text-dark-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-dark-700 dark:text-dark-300 whitespace-pre-wrap">
                                    {comment.message}
                                </p>
                                <p className="text-xs text-dark-400 mt-2">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    placeholder="Write a comment..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="flex-1"
                />
                <Button
                    type="submit"
                    variant="primary"
                    isLoading={submitting}
                    disabled={!message.trim()}
                    leftIcon={<Send size={18} />}
                >
                    Send
                </Button>
            </form>
        </div>
    );
}
