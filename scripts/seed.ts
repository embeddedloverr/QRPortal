// Seed script to create admin user
// Run with: npx ts-node scripts/seed.ts

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/qr-portal';

// User schema for seeding
const UserSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    role: { type: String, enum: ['user', 'engineer', 'supervisor', 'admin'] },
    phone: String,
    department: String,
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);

        // Create or update admin user
        const hashedPassword = await bcrypt.hash('admin123', 12);

        await User.findOneAndUpdate(
            { email: 'admin@qrportal.com' },
            {
                name: 'Admin User',
                email: 'admin@qrportal.com',
                password: hashedPassword,
                role: 'admin',
                department: 'IT',
                isActive: true
            },
            { upsert: true, new: true }
        );

        console.log('\n=== Admin Created ===');
        console.log('Email: admin@qrportal.com');
        console.log('Password: admin123');
        console.log('=====================\n');

        await mongoose.disconnect();
        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
