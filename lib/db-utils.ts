import { db } from "@/db";
import { category, transaction, asset, investment, document } from "@/db/schema/finance";
import { Database } from "@/db";
import { and, desc, eq, gte, lte, sum } from "drizzle-orm";

// Category operations
export const getCategories = async (db: Database, type?: string) => {
  return await db.query.category.findMany({
    where: type ? eq(category.type, type) : undefined,
    orderBy: [category.name],
  });
};

export const getCategoryById = async (db: Database, id: number) => {
  return await db.query.category.findFirst({
    where: eq(category.id, id),
  });
};

export const createCategory = async (db: Database, data: typeof category.$inferInsert) => {
  return await db.insert(category).values(data).returning();
};

export const updateCategory = async (db: Database, id: number, data: Partial<typeof category.$inferInsert>) => {
  return await db.update(category).set(data).where(eq(category.id, id)).returning();
};

export const deleteCategory = async (db: Database, id: number) => {
  return await db.delete(category).where(eq(category.id, id)).returning();
};

// Transaction operations
export const getTransactions = async (
  db: Database, 
  userId: string, 
  type?: string, 
  startDate?: Date, 
  endDate?: Date,
  limit?: number
) => {
  return await db.query.transaction.findMany({
    where: and(
      eq(transaction.userId, userId),
      type ? eq(transaction.type, type) : undefined,
      startDate ? gte(transaction.date, startDate.toISOString()) : undefined,
      endDate ? lte(transaction.date, endDate.toISOString()) : undefined
    ),
    orderBy: [desc(transaction.date)],
    limit: limit,
    with: {
      category: true,
    }
  });
};

export const getTransactionById = async (db: Database, id: number) => {
  return await db.query.transaction.findFirst({
    where: eq(transaction.id, id),
    with: {
      category: true,
    }
  });
};

export const createTransaction = async (db: Database, data: typeof transaction.$inferInsert) => {
  return await db.insert(transaction).values(data).returning();
};

export const updateTransaction = async (db: Database, id: number, data: Partial<typeof transaction.$inferInsert>) => {
  return await db.update(transaction).set(data).where(eq(transaction.id, id)).returning();
};

export const deleteTransaction = async (db: Database, id: number) => {
  return await db.delete(transaction).where(eq(transaction.id, id)).returning();
};

// Asset operations
export const getAssets = async (db: Database, userId: string) => {
  return await db.query.asset.findMany({
    where: eq(asset.userId, userId),
    orderBy: [desc(asset.purchaseDate)],
    with: {
      category: true,
    }
  });
};

export const getAssetById = async (db: Database, id: number) => {
  return await db.query.asset.findFirst({
    where: eq(asset.id, id),
    with: {
      category: true,
    }
  });
};

export const createAsset = async (db: Database, data: typeof asset.$inferInsert) => {
  return await db.insert(asset).values(data).returning();
};

export const updateAsset = async (db: Database, id: number, data: Partial<typeof asset.$inferInsert>) => {
  return await db.update(asset).set(data).where(eq(asset.id, id)).returning();
};

export const deleteAsset = async (db: Database, id: number) => {
  return await db.delete(asset).where(eq(asset.id, id)).returning();
};

// Investment operations
export const getInvestments = async (db: Database, userId: string) => {
  return await db.query.investment.findMany({
    where: eq(investment.userId, userId),
    orderBy: [desc(investment.purchaseDate)],
    with: {
      category: true,
    }
  });
};

export const getInvestmentById = async (db: Database, id: number) => {
  return await db.query.investment.findFirst({
    where: eq(investment.id, id),
    with: {
      category: true,
    }
  });
};

export const createInvestment = async (db: Database, data: typeof investment.$inferInsert) => {
  return await db.insert(investment).values(data).returning();
};

export const updateInvestment = async (db: Database, id: number, data: Partial<typeof investment.$inferInsert>) => {
  return await db.update(investment).set(data).where(eq(investment.id, id)).returning();
};

export const deleteInvestment = async (db: Database, id: number) => {
  return await db.delete(investment).where(eq(investment.id, id)).returning();
};

// Document operations
export const getDocuments = async (db: Database, userId: string) => {
  return await db.query.document.findMany({
    where: eq(document.userId, userId),
    orderBy: [desc(document.uploadDate)],
  });
};

export const getDocumentById = async (db: Database, id: number) => {
  return await db.query.document.findFirst({
    where: eq(document.id, id),
  });
};

export const createDocument = async (db: Database, data: typeof document.$inferInsert) => {
  return await db.insert(document).values(data).returning();
};

export const updateDocument = async (db: Database, id: number, data: Partial<typeof document.$inferInsert>) => {
  return await db.update(document).set(data).where(eq(document.id, id)).returning();
};

export const deleteDocument = async (db: Database, id: number) => {
  return await db.delete(document).where(eq(document.id, id)).returning();
};

// Dashboard summary
export const getDashboardSummary = async (db: Database, userId: string) => {
  // Get total income
  const incomeResult = await db.select({
    total: sum(transaction.amount)
  })
  .from(transaction)
  .where(and(
    eq(transaction.userId, userId),
    eq(transaction.type, 'income')
  ));
  
  const totalIncome = parseFloat(incomeResult[0]?.total || '0');
  
  // Get total expenses
  const expenseResult = await db.select({
    total: sum(transaction.amount)
  })
  .from(transaction)
  .where(and(
    eq(transaction.userId, userId),
    eq(transaction.type, 'expense')
  ));
  
  const totalExpenses = parseFloat(expenseResult[0]?.total || '0');
  
  // Get total assets
  const assetResult = await db.select({
    total: sum(asset.currentValue)
  })
  .from(asset)
  .where(eq(asset.userId, userId));
  
  const totalAssets = parseFloat(assetResult[0]?.total || '0');
  
  // Get total investments
  const investmentResult = await db.select({
    total: sum(investment.currentValue)
  })
  .from(investment)
  .where(eq(investment.userId, userId));
  
  const totalInvestments = parseFloat(investmentResult[0]?.total || '0');
  
  return {
    totalIncome,
    totalExpenses,
    netWorth: (totalAssets + totalInvestments) - totalExpenses,
    profitLoss: totalIncome - totalExpenses,
    totalAssets,
    totalInvestments
  };
};