import { NextResponse } from 'next/server';
import { deleteSessionInResponse } from '@/lib/auth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  return deleteSessionInResponse(response);
}

