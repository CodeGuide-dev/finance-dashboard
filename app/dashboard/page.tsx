'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Building,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
} from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { format } from 'date-fns';
import { ChartAreaInteractive } from '@/components/chart-area-interactive';

interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netWorth: number;
  profitLoss: number;
  totalAssets: number;
  totalInvestments: number;
}

interface RecentTransaction {
  id: number;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: {
    name: string;
  };
}

interface QuickAction {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  const quickActions: QuickAction[] = [
    {
      title: 'Add Transaction',
      description: 'Record a new income or expense',
      href: '/dashboard/transactions',
      icon: <Plus className="h-5 w-5" />,
    },
    {
      title: 'View Assets',
      description: 'Manage your company assets',
      href: '/dashboard/assets',
      icon: <Building className="h-5 w-5" />,
    },
    {
      title: 'Track Investments',
      description: 'Monitor your investment portfolio',
      href: '/dashboard/investments',
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: 'Manage Documents',
      description: 'Upload and organize financial documents',
      href: '/dashboard/documents',
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard summary
        const summaryResponse = await fetch('/api/dashboard');
        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setSummary(summaryData);
        }

        // Fetch recent transactions
        const transactionsResponse = await fetch('/api/transactions?limit=5');
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setRecentTransactions(transactionsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session?.user?.name || 'User'}
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalIncome.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.totalExpenses.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Worth</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.netWorth.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit/Loss</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary?.profitLoss.toLocaleString() || '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              +3% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Chart */}
      <ChartAreaInteractive />

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4">
        {quickActions.map((action) => (
          <Card key={action.title} className="hover:bg-muted/50 transition-colors">
            <Link href={action.href}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{action.title}</CardTitle>
                {action.icon}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  {action.description}
                </div>
              </CardContent>
            </Link>
          </Card>
        ))}
      </div>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Transactions</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard/transactions">
                View all <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <CardDescription>
            Your most recent income and expense transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center">
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.category.name} • {format(new Date(transaction.date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <div className="ml-auto font-medium">
                    <span className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}>
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No transactions yet</p>
              <Button variant="outline" className="mt-4" asChild>
                <Link href="/dashboard/transactions">
                  <Plus className="mr-2 h-4 w-4" />
                  Add your first transaction
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Financial Overview */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Assets Overview</CardTitle>
            <CardDescription>
              Total value of company assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary?.totalAssets.toLocaleString() || '0'}
            </div>
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="mr-2">
                +2.5%
              </Badge>
              <span className="text-sm text-muted-foreground">
                from last quarter
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Investments</CardTitle>
            <CardDescription>
              Current value of investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${summary?.totalInvestments.toLocaleString() || '0'}
            </div>
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="mr-2">
                +5.2%
              </Badge>
              <span className="text-sm text-muted-foreground">
                from last quarter
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}