import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

// POST - Upload file(s)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
        const folder = formData.get('folder') as string || 'general';

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }

        // Create upload directory if it doesn't exist
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
            if (!validTypes.includes(file.type)) {
                continue; // Skip invalid files
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                continue; // Skip large files
            }

            // Generate unique filename
            const ext = file.name.split('.').pop();
            const filename = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const filepath = path.join(uploadDir, filename);

            // Write file
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            await writeFile(filepath, buffer);

            // Return public URL
            uploadedUrls.push(`/uploads/${folder}/${filename}`);
        }

        if (uploadedUrls.length === 0) {
            return NextResponse.json(
                { error: 'No valid files were uploaded' },
                { status: 400 }
            );
        }

        return NextResponse.json({ urls: uploadedUrls }, { status: 201 });
    } catch (error: any) {
        console.error('Error uploading files:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload files' },
            { status: 500 }
        );
    }
}
