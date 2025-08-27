import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import 'dotenv/config';
import { 
  category, 
  transaction, 
  asset, 
  investment, 
  document 
} from '../db/schema/finance';
import { user } from '../db/schema/auth';

// Create a PostgreSQL pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create the Drizzle ORM instance
const db = drizzle(pool);

async function seedCategories() {
  console.log('Seeding categories...');
  
  const categories = [
    // Expense categories
    { name: 'Office Supplies', type: 'expense', description: 'Office supplies and materials' },
    { name: 'Travel', type: 'expense', description: 'Business travel expenses' },
    { name: 'Meals', type: 'expense', description: 'Business meals and entertainment' },
    { name: 'Utilities', type: 'expense', description: 'Electricity, water, internet, etc.' },
    { name: 'Salaries', type: 'expense', description: 'Employee salaries and wages' },
    { name: 'Marketing', type: 'expense', description: 'Marketing and advertising expenses' },
    { name: 'Software', type: 'expense', description: 'Software licenses and subscriptions' },
    { name: 'Rent', type: 'expense', description: 'Office rent and facilities' },
    { name: 'Insurance', type: 'expense', description: 'Business insurance premiums' },
    { name: 'Maintenance', type: 'expense', description: 'Equipment and facility maintenance' },
    
    // Income categories
    { name: 'Product Sales', type: 'income', description: 'Revenue from product sales' },
    { name: 'Service Revenue', type: 'income', description: 'Revenue from services provided' },
    { name: 'Investment Income', type: 'income', description: 'Income from investments' },
    { name: 'Consulting Fees', type: 'income', description: 'Consulting service fees' },
    { name: 'Other Income', type: 'income', description: 'Other miscellaneous income' },
    
    // Asset categories
    { name: 'Office Equipment', type: 'asset', description: 'Computers, printers, office furniture' },
    { name: 'Vehicles', type: 'asset', description: 'Company vehicles' },
    { name: 'Property', type: 'asset', description: 'Real estate and buildings' },
    { name: 'Machinery', type: 'asset', description: 'Industrial machinery and equipment' },
    
    // Investment categories
    { name: 'Stocks', type: 'investment', description: 'Stock market investments' },
    { name: 'Bonds', type: 'investment', description: 'Bond investments' },
    { name: 'Real Estate', type: 'investment', description: 'Real estate investments' },
    { name: 'Mutual Funds', type: 'investment', description: 'Mutual fund investments' },
    { name: 'Crypto', type: 'investment', description: 'Cryptocurrency investments' },
  ];
  
  // Insert categories
  for (const cat of categories) {
    await db.insert(category).values(cat).onConflictDoNothing();
  }
  
  console.log('Categories seeded successfully');
}

async function seedUsers() {
  console.log('Seeding users...');
  
  const users = [
    {
      id: 'user_1',
      name: 'John Doe',
      email: 'john@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'user_2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      emailVerified: true,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  
  // Insert users
  for (const usr of users) {
    await db.insert(user).values(usr).onConflictDoNothing();
  }
  
  console.log('Users seeded successfully');
}

async function seedTransactions(userId: string) {
  console.log('Seeding transactions...');
  
  // Get expense and income category IDs
  const expenseCategories = await db.select().from(category).where(sql`type = 'expense'`);
  const incomeCategories = await db.select().from(category).where(sql`type = 'income'`);
  
  type TransactionsType = typeof transaction.$inferInsert

  // Generate realistic transactions over the past year with positive net worth
  const transactions: TransactionsType[] = [];
  const today = new Date();
  
  // Monthly revenue patterns (higher in certain months)
  const monthlyRevenue = [
    15000, 18000, 22000, 25000, 28000, 32000, // H1: Growing business
    30000, 35000, 33000, 38000, 42000, 45000  // H2: Peak season
  ];
  
  // Generate monthly transactions
  for (let month = 0; month < 12; month++) {
    const targetRevenue = monthlyRevenue[month];
    const baseDate = new Date(today);
    baseDate.setMonth(today.getMonth() - (11 - month));
    baseDate.setDate(1);
    
    // Generate income transactions (fewer, larger amounts)
    const incomeCount = Math.floor(Math.random() * 5) + 8; // 8-12 income transactions per month
    let totalIncome = 0;
    
    for (let i = 0; i < incomeCount; i++) {
      const randomCategory = incomeCategories[Math.floor(Math.random() * incomeCategories.length)];
      const transactionDate = new Date(baseDate);
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      // Distribute revenue across transactions with some larger payments
      let amount;
      if (i === 0) {
        // First transaction is usually the largest (main client payment)
        amount = Math.floor(targetRevenue * 0.4) + Math.floor(Math.random() * 5000);
      } else if (i === 1) {
        // Second largest payment
        amount = Math.floor(targetRevenue * 0.25) + Math.floor(Math.random() * 2000);
      } else {
        // Smaller recurring payments
        amount = Math.floor(Math.random() * 3000) + 500;
      }
      
      totalIncome += amount;
      
      transactions.push({
        userId,
        categoryId: randomCategory.id,
        type: 'income',
        amount: amount.toFixed(2),
        description: `${randomCategory.name} - ${transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
        date: transactionDate.toISOString(),
        isApproved: true,
        receiptUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    // Generate expense transactions (more frequent, smaller amounts)
    // Keep expenses at 60-75% of income to maintain profitability
    const targetExpenses = Math.floor(totalIncome * (0.60 + Math.random() * 0.15));
    const expenseCount = Math.floor(Math.random() * 15) + 20; // 20-35 expense transactions per month
    let totalExpenses = 0;
    
    for (let i = 0; i < expenseCount && totalExpenses < targetExpenses; i++) {
      const randomCategory = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const transactionDate = new Date(baseDate);
      transactionDate.setDate(Math.floor(Math.random() * 28) + 1);
      
      let amount;
      // Different expense patterns based on category
      if (randomCategory.name === 'Salaries') {
        amount = Math.floor(Math.random() * 8000) + 3000; // $3k-11k for salaries
      } else if (randomCategory.name === 'Rent') {
        amount = Math.floor(Math.random() * 2000) + 3000; // $3k-5k for rent
      } else if (randomCategory.name === 'Marketing') {
        amount = Math.floor(Math.random() * 2000) + 500; // $500-2.5k for marketing
      } else if (randomCategory.name === 'Software') {
        amount = Math.floor(Math.random() * 500) + 100; // $100-600 for software
      } else {
        amount = Math.floor(Math.random() * 1000) + 50; // $50-1050 for other expenses
      }
      
      // Don't exceed target expenses
      if (totalExpenses + amount > targetExpenses) {
        amount = targetExpenses - totalExpenses;
      }
      
      if (amount > 0) {
        totalExpenses += amount;
        
        transactions.push({
          userId,
          categoryId: randomCategory.id,
          type: 'expense',
          amount: amount.toFixed(2),
          description: `${randomCategory.name} - ${transactionDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
          date: transactionDate.toISOString(),
          isApproved: Math.random() > 0.05, // 95% approved
          receiptUrl: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  }
  
  // Insert transactions
    await db.insert(transaction).values(transactions);
  
  console.log('Transactions seeded successfully');
}

async function seedAssets(userId: string) {
  console.log('Seeding assets...');
  
  // Get asset category IDs
  const assetCategories = await db.select().from(category).where(sql`type = 'asset'`);
  
  if (assetCategories.length === 0) return;

  type AssetCategoriesType = typeof asset.$inferInsert
  
  const assets = [
    {
      userId,
      categoryId: assetCategories[0].id, // Office Equipment
      name: 'MacBook Pro M3 Max',
      description: 'High-performance laptop for development and design work',
      purchaseDate: new Date('2024-02-15'),
      purchasePrice: '3499.99',
      currentValue: '3200.00',
      depreciationRate: '15.00',
      maintenanceSchedule: 'Annual AppleCare checkup',
      insuranceInfo: 'Covered under business equipment policy - $5000 coverage',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: assetCategories[0].id, // Office Equipment
      name: 'Herman Miller Aeron Chair',
      description: 'Ergonomic office chair for productivity and health',
      purchaseDate: new Date('2023-08-20'),
      purchasePrice: '1395.00',
      currentValue: '1250.00',
      depreciationRate: '5.00',
      maintenanceSchedule: 'Quarterly adjustment and cleaning',
      insuranceInfo: 'Covered under business equipment policy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: assetCategories[0].id, // Office Equipment
      name: 'Ultrawide Monitor Setup',
      description: 'Dual 34" curved ultrawide monitors for development',
      purchaseDate: new Date('2023-11-10'),
      purchasePrice: '2200.00',
      currentValue: '1900.00',
      depreciationRate: '12.00',
      maintenanceSchedule: 'Monthly screen cleaning and calibration',
      insuranceInfo: 'Covered under business equipment policy',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: assetCategories[2].id, // Property
      name: 'Downtown Office Space',
      description: 'Modern co-working space in prime business district',
      purchaseDate: new Date('2022-03-10'),
      purchasePrice: '850000.00',
      currentValue: '975000.00',
      depreciationRate: '-3.50', // Appreciating asset
      maintenanceSchedule: 'Quarterly professional cleaning and maintenance',
      insuranceInfo: 'Full commercial property insurance - $1.2M coverage',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: assetCategories[1].id, // Vehicles
      name: 'Tesla Model Y',
      description: 'Electric company vehicle for client meetings and transport',
      purchaseDate: new Date('2023-06-05'),
      purchasePrice: '58000.00',
      currentValue: '48000.00',
      depreciationRate: '18.00',
      maintenanceSchedule: 'Quarterly service and software updates',
      insuranceInfo: 'Commercial EV insurance with comprehensive coverage',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: assetCategories[3].id, // Machinery
      name: '3D Printer & CNC Machine',
      description: 'Prototyping and manufacturing equipment for product development',
      purchaseDate: new Date('2023-09-15'),
      purchasePrice: '15000.00',
      currentValue: '13500.00',
      depreciationRate: '10.00',
      maintenanceSchedule: 'Monthly calibration and maintenance',
      insuranceInfo: 'Specialized equipment insurance',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ] as any as AssetCategoriesType[]
  
  // Insert assets
    await db.insert(asset).values(assets);
  
  console.log('Assets seeded successfully');
}

async function seedInvestments(userId: string) {
  console.log('Seeding investments...');
  
  // Get investment category IDs
  const investmentCategories = await db.select().from(category).where(sql`type = 'investment'`);
  
  if (investmentCategories.length === 0) return;

  type InvestmentType = typeof investment.$inferInsert
  
  const investmentsPayload = [
    {
      userId,
      categoryId: investmentCategories[0].id, // Stocks
      name: 'NVIDIA Corporation (NVDA)',
      description: 'AI and semiconductor growth stock investment',
      type: 'Stocks',
      purchaseDate: new Date('2023-01-15'),
      purchasePrice: '45000.00',
      currentValue: '78000.00',
      quantity: '150.0000',
      roi: '73.33',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[0].id, // Stocks
      name: 'Apple Inc. (AAPL)',
      description: 'Blue-chip technology stock for stability',
      type: 'Stocks',
      purchaseDate: new Date('2022-06-30'),
      purchasePrice: '25000.00',
      currentValue: '32500.00',
      quantity: '175.0000',
      roi: '30.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[2].id, // Real Estate
      name: 'REIT Diversified Portfolio',
      description: 'Real Estate Investment Trust for passive income',
      type: 'Real Estate',
      purchaseDate: new Date('2021-08-15'),
      purchasePrice: '75000.00',
      currentValue: '89000.00',
      quantity: '1500.0000',
      roi: '18.67',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[3].id, // Mutual Funds
      name: 'Vanguard Total Stock Market',
      description: 'Low-cost broad market index fund',
      type: 'Mutual Funds',
      purchaseDate: new Date('2022-03-10'),
      purchasePrice: '50000.00',
      currentValue: '62500.00',
      quantity: '450.0000',
      roi: '25.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[1].id, // Bonds
      name: 'Treasury I-Bonds',
      description: 'Inflation-protected government bonds',
      type: 'Bonds',
      purchaseDate: new Date('2023-01-20'),
      purchasePrice: '30000.00',
      currentValue: '32400.00',
      quantity: '30.0000',
      roi: '8.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[4].id, // Crypto
      name: 'Bitcoin Portfolio',
      description: 'Digital asset allocation for portfolio diversification',
      type: 'Crypto',
      purchaseDate: new Date('2023-10-15'),
      purchasePrice: '20000.00',
      currentValue: '28500.00',
      quantity: '0.4500',
      roi: '42.50',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      categoryId: investmentCategories[4].id, // Crypto
      name: 'Ethereum Holdings',
      description: 'Smart contract platform investment',
      type: 'Crypto',
      purchaseDate: new Date('2023-07-20'),
      purchasePrice: '15000.00',
      currentValue: '19500.00',
      quantity: '8.2500',
      roi: '30.00',
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ] as any as InvestmentType[]
  
  // Insert investmentsPayload
  await db.insert(investment).values(investmentsPayload );
  
  console.log('Investments seeded successfully');
}

async function seedDocuments(userId: string) {
  console.log('Seeding documents...');
  
  const documents = [
    {
      userId,
      name: 'Downtown Office Lease Agreement 2024',
      url: 'https://documents.company.com/lease/downtown-office-2024.pdf',
      type: 'contract',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2024-01-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Q4 2024 Financial Statement',
      url: 'https://documents.company.com/financial/q4-2024-report.pdf',
      type: 'statement',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2024-12-31'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Business Liability Insurance Policy',
      url: 'https://documents.company.com/insurance/liability-policy-2024.pdf',
      type: 'contract',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2024-03-01'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Tesla Model Y Purchase Agreement',
      url: 'https://documents.company.com/vehicles/tesla-purchase-2023.pdf',
      type: 'receipt',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2023-06-05'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'NVDA Stock Purchase Confirmation',
      url: 'https://documents.company.com/investments/nvda-purchase-2023.pdf',
      type: 'receipt',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2023-01-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'MacBook Pro M3 Max Receipt',
      url: 'https://documents.company.com/equipment/macbook-receipt-2024.pdf',
      type: 'receipt',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2024-02-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      userId,
      name: 'Annual Tax Return 2023',
      url: 'https://documents.company.com/tax/annual-return-2023.pdf',
      type: 'tax',
      relatedId: null,
      relatedType: null,
      uploadDate: new Date('2024-04-15'),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  ];
  
  // Insert documents
  for (const doc of documents) {
    await db.insert(document).values(doc);
  }
  
  console.log('Documents seeded successfully');
}

async function main() {
  try {
    console.log('Running database seed...');
    
    // Seed categories first
    await seedCategories();
    
    // Seed users
    await seedUsers();
    
    // Get the first user ID for seeding financial data
    const users = await db.select().from(user);
    if (users.length === 0) {
      console.error('No users found. Please seed users first.');
      return;
    }
    
    const userId = users[0].id;
    
    // Seed financial data
    await seedTransactions(userId);
    await seedAssets(userId);
    await seedInvestments(userId);
    await seedDocuments(userId);
    
    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error running seed:', error);
  } finally {
    await pool.end();
  }
}

main();