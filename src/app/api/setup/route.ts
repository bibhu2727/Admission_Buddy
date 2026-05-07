import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    await dbConnect();

    const userCount = await User.countDocuments();
    
    if (userCount > 0) {
      return NextResponse.json({ message: 'Admin already exists. Setup skipped.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    await User.create({
      name: 'System Admin',
      email: 'admin@admbuddy.com',
      password: hashedPassword,
      role: 'Admin',
    });

    return NextResponse.json({ message: 'Admin user created successfully: admin@admbuddy.com / admin123' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
