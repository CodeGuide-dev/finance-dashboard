import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { transaction } from '@/db/schema/finance';
import { eq, and, gte, lte } from 'drizzle-orm';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // Get the date range from query parameters
    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get('days');
    const days = daysParam ? parseInt(daysParam) : 90;
    
    // Calculate the start date
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch transactions within the date range
    const transactions = await db.query.transaction.findMany({
      where: and(
        eq(transaction.userId, userId),
        gte(transaction.date, startDate.toISOString()),
        lte(transaction.date, endDate.toISOString())
      ),
      orderBy: [transaction.date],
    });
    
    // Group transactions by date and calculate cumulative values
    const financialData: Record<string, { income: number; expenses: number }> = {};
    
    // Initialize with starting values
    let cumulativeIncome = 0;
    let cumulativeExpenses = 0;
    
    // Group transactions by date
    transactions.forEach(trans => {
      const dateStr = new Date(trans.date).toISOString().split('T')[0];
      
      if (!financialData[dateStr]) {
        financialData[dateStr] = { income: 0, expenses: 0 };
      }
      
      if (trans.type === 'income') {
        financialData[dateStr].income += parseFloat(trans.amount.toString());
      } else {
        financialData[dateStr].expenses += parseFloat(trans.amount.toString());
      }
    });
    
    // Convert to array and calculate cumulative values
    const result = Object.entries(financialData)
      .map(([date, values]) => {
        cumulativeIncome += values.income;
        cumulativeExpenses += values.expenses;
        
        return {
          date,
          income: parseFloat(cumulativeIncome.toFixed(2)),
          expenses: parseFloat(cumulativeExpenses.toFixed(2)),
          netWorth: parseFloat((cumulativeIncome - cumulativeExpenses).toFixed(2))
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching financial chart data:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}