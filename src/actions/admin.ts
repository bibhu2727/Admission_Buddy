'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function createCounselor(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'Admin') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!name || !email || !password) {
    throw new Error('Missing required fields');
  }

  await dbConnect();

  const existing = await User.findOne({ email });
  if (existing) {
    throw new Error('Email already registered');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'Counselor',
  });

  revalidatePath('/admin');
  return { success: true };
}
