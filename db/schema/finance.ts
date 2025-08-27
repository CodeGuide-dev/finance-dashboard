import { pgTable, serial, text, integer, varchar, decimal, timestamp, boolean, date, primaryKey } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { relations } from "drizzle-orm";

// Categories for transactions
export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(), // expense, income, asset, investment
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Transactions (expenses and income)
export const transaction = pgTable("transaction", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "set null" }),
  type: varchar("type", { length: 20 }).notNull(), // expense, income
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  isApproved: boolean("is_approved").notNull().default(false),
  receiptUrl: text("receipt_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Assets
export const asset = pgTable("asset", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  purchaseDate: date("purchase_date").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }),
  depreciationRate: decimal("depreciation_rate", { precision: 5, scale: 2 }), // percentage
  categoryId: integer("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "set null" }),
  maintenanceSchedule: text("maintenance_schedule"),
  insuranceInfo: text("insurance_info"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Investments
export const investment = pgTable("investment", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  type: varchar("type", { length: 50 }).notNull(), // stock, bond, real estate, etc.
  purchaseDate: date("purchase_date").notNull(),
  purchasePrice: decimal("purchase_price", { precision: 12, scale: 2 }).notNull(),
  currentValue: decimal("current_value", { precision: 12, scale: 2 }),
  quantity: decimal("quantity", { precision: 12, scale: 4 }),
  roi: decimal("roi", { precision: 5, scale: 2 }), // return on investment percentage
  categoryId: integer("category_id")
    .notNull()
    .references(() => category.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Documents
export const document = pgTable("document", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  url: text("url").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // receipt, invoice, contract, etc.
  relatedId: integer("related_id"), // ID of related transaction, asset, or investment
  relatedType: varchar("related_type", { length: 20 }), // transaction, asset, investment
  uploadDate: timestamp("upload_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Relations
export const categoryRelations = relations(category, ({ many }) => ({
  transactions: many(transaction),
  assets: many(asset),
  investments: many(investment),
}));

export const transactionRelations = relations(transaction, ({ one }) => ({
  user: one(user, {
    fields: [transaction.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [transaction.categoryId],
    references: [category.id],
  }),
}));

export const assetRelations = relations(asset, ({ one }) => ({
  user: one(user, {
    fields: [asset.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [asset.categoryId],
    references: [category.id],
  }),
}));

export const investmentRelations = relations(investment, ({ one }) => ({
  user: one(user, {
    fields: [investment.userId],
    references: [user.id],
  }),
  category: one(category, {
    fields: [investment.categoryId],
    references: [category.id],
  }),
}));

export const documentRelations = relations(document, ({ one }) => ({
  user: one(user, {
    fields: [document.userId],
    references: [user.id],
  }),
}));