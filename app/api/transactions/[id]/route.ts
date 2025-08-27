import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedRequest } from '@/lib/api-utils';
import { db } from '@/db';
import { getTransactionById, updateTransaction, deleteTransaction } from '@/lib/db-utils';

// GET /api/transactions/[id] - Get a specific transaction
export const GET = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    const transaction = await getTransactionById(db, transactionId);
    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if the transaction belongs to the current user
    if (transaction.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error fetching transaction:', error);
    return NextResponse.json({ error: 'Failed to fetch transaction' }, { status: 500 });
  }
});

// PUT /api/transactions/[id] - Update a specific transaction
export const PUT = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    const existingTransaction = await getTransactionById(db, transactionId);
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if the transaction belongs to the current user
    if (existingTransaction.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const body = await req.json();
    
    const updatedTransaction = await updateTransaction(db, transactionId, body);
    return NextResponse.json(updatedTransaction[0]);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
});

// DELETE /api/transactions/[id] - Delete a specific transaction
export const DELETE = withAuth(async (req: AuthenticatedRequest, { params }: { params: Promise<Record<string, string>> }) => {
  try {
    const resolvedParams = await params;
    const transactionId = parseInt(resolvedParams.id);
    if (isNaN(transactionId)) {
      return NextResponse.json({ error: 'Invalid transaction ID' }, { status: 400 });
    }
    
    const existingTransaction = await getTransactionById(db, transactionId);
    if (!existingTransaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }
    
    // Check if the transaction belongs to the current user
    if (existingTransaction.userId !== req.user!.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    
    const deletedTransaction = await deleteTransaction(db, transactionId);
    return NextResponse.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 });
  }
});