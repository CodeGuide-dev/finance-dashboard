import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transaction } from '@/db/schema/finance';
import { eq } from 'drizzle-orm';

export async function GET(req: NextRequest) {
  try {
    // Fetch all transactions for testing
    const transactions = await db.select().from(transaction);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}