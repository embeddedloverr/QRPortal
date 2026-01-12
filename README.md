# QR Portal - Equipment Complaint Management

A Next.js dashboard for QR-based equipment complaint management with role-based access control.

## Features

- 🔐 Role-based authentication (User, Engineer, Supervisor, Admin)
- 📱 QR code scanning for equipment identification
- 🎫 Complete ticket lifecycle management
- 📸 Before/after photo documentation
- ✅ Supervisor verification workflow
- 🌙 Dark/light theme support
- 📱 Fully mobile responsive

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret key
- `NEXTAUTH_URL` - Application URL

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- MongoDB + Mongoose
- NextAuth.js
- Framer Motion
- html5-qrcode
