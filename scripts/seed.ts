// Seed script to create demo data
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

// Equipment schema for seeding
const EquipmentSchema = new mongoose.Schema({
    name: String,
    type: { type: String, enum: ['ac_unit', 'pump', 'generator', 'elevator', 'other'] },
    qrCode: { type: String, unique: true },
    serialNumber: String,
    location: {
        building: String,
        floor: String,
        room: String,
    },
    supplier: {
        name: String,
        contact: String,
        email: String,
    },
    status: { type: String, default: 'active' },
}, { timestamps: true });

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const User = mongoose.models.User || mongoose.model('User', UserSchema);
        const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', EquipmentSchema);

        // Clear existing data
        await User.deleteMany({});
        await Equipment.deleteMany({});
        console.log('Cleared existing data');

        // Hash password
        const hashedPassword = await bcrypt.hash('password123', 12);

        // Create users
        const users = await User.insertMany([
            { name: 'Admin User', email: 'admin@qrportal.com', password: await bcrypt.hash('admin123', 12), role: 'admin', department: 'IT' },
            { name: 'John Supervisor', email: 'supervisor@qrportal.com', password: hashedPassword, role: 'supervisor', department: 'Maintenance' },
            { name: 'Mike Engineer', email: 'engineer@qrportal.com', password: hashedPassword, role: 'engineer', phone: '+91 9876543210' },
            { name: 'Sarah Engineer', email: 'sarah@qrportal.com', password: hashedPassword, role: 'engineer', phone: '+91 9876543211' },
            { name: 'Demo User', email: 'user@qrportal.com', password: hashedPassword, role: 'user', department: 'HR' },
        ]);
        console.log(`Created ${users.length} users`);

        // Create equipment
        const equipment = await Equipment.insertMany([
            { name: 'Split AC Unit - Conference Room', type: 'ac_unit', qrCode: 'EQ-AC001', location: { building: 'Building A', floor: '2nd Floor', room: 'Room 201' }, supplier: { name: 'Cool Air Systems', contact: '+91 9000000001' }, status: 'active' },
            { name: 'Ceiling AC - Reception', type: 'ac_unit', qrCode: 'EQ-AC002', location: { building: 'Building A', floor: 'Ground Floor', room: 'Lobby' }, supplier: { name: 'Cool Air Systems', contact: '+91 9000000001' }, status: 'active' },
            { name: 'Water Pump - Main', type: 'pump', qrCode: 'EQ-PMP001', location: { building: 'Building B', floor: 'Basement', room: 'Utility Room' }, supplier: { name: 'HydroTech', contact: '+91 9000000002' }, status: 'active' },
            { name: 'Backup Generator', type: 'generator', qrCode: 'EQ-GEN001', location: { building: 'Building A', floor: 'Terrace', room: 'Generator Room' }, supplier: { name: 'PowerGen Ltd', contact: '+91 9000000003' }, status: 'active' },
            { name: 'Passenger Elevator 1', type: 'elevator', qrCode: 'EQ-ELV001', location: { building: 'Building A', floor: 'All Floors', room: 'Elevator Shaft' }, supplier: { name: 'LiftMaster', contact: '+91 9000000004' }, status: 'active' },
            { name: 'Fire Pump', type: 'pump', qrCode: 'EQ-PMP002', location: { building: 'Building B', floor: 'Basement', room: 'Fire Room' }, supplier: { name: 'SafetyFirst', contact: '+91 9000000005' }, status: 'active' },
        ]);
        console.log(`Created ${equipment.length} equipment`);

        console.log('\n=== Demo Credentials ===');
        console.log('Admin: admin@qrportal.com / admin123');
        console.log('Supervisor: supervisor@qrportal.com / password123');
        console.log('Engineer: engineer@qrportal.com / password123');
        console.log('User: user@qrportal.com / password123');
        console.log('========================\n');

        await mongoose.disconnect();
        console.log('Seed completed successfully!');
    } catch (error) {
        console.error('Seed error:', error);
        process.exit(1);
    }
}

seed();
