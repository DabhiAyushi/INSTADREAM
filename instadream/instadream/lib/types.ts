import { z } from 'zod';

// Expense categories
export const expenseCategories = [
  'food',
  'lifestyle',
  'subscriptions',
  'transportation',
  'shopping',
  'entertainment',
  'utilities',
  'healthcare',
  'other',
] as const;

export type ExpenseCategory = typeof expenseCategories[number];

// Zod schema for a single expense item
export const expenseSchema = z.object({
  merchantName: z.string().nullable().optional(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  category: z.enum(expenseCategories),
  date: z.string().nullable().optional(), // ISO date string
  description: z.string().nullable().optional(),
  confidence: z.number().min(0).max(100).optional(),
});

// Zod schema for the AI response with multiple expenses
export const receiptAnalysisSchema = z.object({
  expenses: z.array(expenseSchema),
  totalAmount: z.number().optional(),
  currency: z.string().default('INR'),
  receiptDate: z.string().nullable().optional(),
  merchantName: z.string().nullable().optional(),
});

// TypeScript types inferred from Zod schemas
export type Expense = z.infer<typeof expenseSchema>;
export type ReceiptAnalysis = z.infer<typeof receiptAnalysisSchema>;

// Receipt status
export type ReceiptStatus = 'pending' | 'processed' | 'failed';

// Database types
export interface Receipt {
  id: number;
  imageUrl: string | null;
  uploadedAt: Date;
  processedAt: Date | null;
  status: ReceiptStatus;
}

export interface ExpenseRecord {
  id: number;
  receiptId: number;
  merchantName: string | null;
  amount: string; // Decimal stored as string
  currency: string;
  category: ExpenseCategory;
  date: Date | null;
  description: string | null;
  confidence: string | null; // Decimal stored as string
  createdAt: Date;
}
