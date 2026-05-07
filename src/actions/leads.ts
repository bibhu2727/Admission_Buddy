'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { revalidatePath } from 'next/cache';

export async function createLead(formData: FormData) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== 'Counselor') {
    throw new Error('Unauthorized');
  }

  const name = formData.get('name') as string;
  const phone = formData.get('phone') as string;
  const channel = formData.get('channel') as 'agent' | 'reff' | 'direct';
  const remark = formData.get('remark') as string;
  const visitDate = formData.get('visitDate') as string;

  if (!name || !phone || !channel || !visitDate) {
    throw new Error('Missing required fields');
  }

  await dbConnect();

  await Lead.create({
    name,
    phone,
    channel,
    remark,
    visitDate: new Date(visitDate),
    counselorId: session.user.id,
  });

  revalidatePath('/');
  return { success: true };
}

export async function updateLeadStatus(leadId: string, status: 'Converted' | 'No Show' | 'Pending' | 'Postponed') {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const lead = await Lead.findOne({ _id: leadId, counselorId: session.user.id });
  
  if (!lead) {
    throw new Error('Lead not found or unauthorized');
  }

  lead.status = status;
  await lead.save();

  revalidatePath('/');
  return { success: true };
}

export async function postponeLead(leadId: string, newDate: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  if (!newDate) {
    throw new Error('New visit date is required');
  }

  await dbConnect();

  const result = await Lead.findOneAndUpdate(
    { _id: leadId, counselorId: session.user.id },
    { $set: { status: 'Postponed', visitDate: new Date(newDate) } },
    { new: true }
  );
  
  if (!result) {
    throw new Error('Lead not found or unauthorized');
  }

  revalidatePath('/');
  return { success: true };
}

export async function updateLeadRemark(leadId: string, remark: string) {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    throw new Error('Unauthorized');
  }

  await dbConnect();

  const lead = await Lead.findOne({ _id: leadId, counselorId: session.user.id });
  
  if (!lead) {
    throw new Error('Lead not found or unauthorized');
  }

  lead.remark = remark;
  await lead.save();

  revalidatePath('/');
  return { success: true };
}
