import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionById } from '@/lib/db-utils';
import { parse } from 'date-fns';

// GET /api/transactions - Get all transactions
export const GET = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || undefined;
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const limitParam = searchParams.get('limit');
    
    const startDate = startDateParam ? parse(startDateParam, 'yyyy-MM-dd', new Date()) : undefined;
    const endDate = endDateParam ? parse(endDateParam, 'yyyy-MM-dd', new Date()) : undefined;
    const limit = limitParam ? parseInt(limitParam) : undefined;
    
    const transactions = await getTransactions(db, req.user!.id, type, startDate, endDate, limit);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
});

// POST /api/transactions - Create a new transaction
export const POST = withAuth(async (req: AuthenticatedRequest) => {
  try {
    const body = await req.json();
    
    // Ensure the transaction is associated with the current user
    const transactionData = {
      ...body,
      userId: req.user!.id
    };
    
    const newTransaction = await createTransaction(db, transactionData);
    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
  }
});