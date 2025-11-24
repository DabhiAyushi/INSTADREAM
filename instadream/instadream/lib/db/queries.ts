import { db } from '@/lib/db';
import { receipts, expenses } from '@/lib/db/schema';
import { sql, desc, eq, and, gte, lte } from 'drizzle-orm';

export type DateRange = {
  from: Date;
  to: Date;
};

// Get spending grouped by category
export async function getSpendingByCategory(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : undefined;

  const result = await db
    .select({
      category: expenses.category,
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(expenses.category)
    .orderBy(sql`total DESC`);

  return result;
}

// Get spending over time (grouped by day)
export async function getSpendingOverTime(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        sql`${expenses.date} IS NOT NULL`,
        gte(expenses.date, dateRange.from),
        lte(expenses.date, dateRange.to)
      )
    : sql`${expenses.date} IS NOT NULL`;

  const result = await db
    .select({
      date: sql<string>`TO_CHAR(${expenses.date}, 'YYYY-MM-DD')`.as('date'),
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(sql`TO_CHAR(${expenses.date}, 'YYYY-MM-DD')`)
    .orderBy(sql`date ASC`);

  return result;
}

// Get top merchants by spending
export async function getTopMerchants(limit: number = 10, dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        sql`${expenses.merchantName} IS NOT NULL`,
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : sql`${expenses.merchantName} IS NOT NULL`;

  const result = await db
    .select({
      merchantName: expenses.merchantName,
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      count: sql<number>`CAST(COUNT(DISTINCT ${expenses.receiptId}) AS INTEGER)`.as('count'),
    })
    .from(expenses)
    .where(conditions)
    .groupBy(expenses.merchantName)
    .orderBy(sql`total DESC`)
    .limit(limit);

  return result;
}

// Get total spending and statistics
export async function getTotalSpending(dateRange?: DateRange) {
  const expenseConditions = dateRange
    ? and(
        gte(expenses.createdAt, dateRange.from),
        lte(expenses.createdAt, dateRange.to)
      )
    : undefined;

  const receiptConditions = dateRange
    ? and(
        gte(receipts.uploadedAt, dateRange.from),
        lte(receipts.uploadedAt, dateRange.to)
      )
    : undefined;

  // Get expense totals
  const expenseResult = await db
    .select({
      total: sql<number>`CAST(COALESCE(SUM(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('total'),
      expenseCount: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('expenseCount'),
      average: sql<number>`CAST(COALESCE(AVG(CAST(${expenses.amount} AS DECIMAL)), 0) AS FLOAT)`.as('average'),
    })
    .from(expenses)
    .where(expenseConditions);

  // Get receipt count
  const receiptResult = await db
    .select({
      receiptCount: sql<number>`CAST(COUNT(*) AS INTEGER)`.as('receiptCount'),
    })
    .from(receipts)
    .where(receiptConditions);

  return {
    total: expenseResult[0].total,
    count: receiptResult[0].receiptCount, // Use receipt count for user-facing "Transactions"
    expenseCount: expenseResult[0].expenseCount, // Keep expense count for internal use
    average: expenseResult[0].average,
  };
}

// Get all receipts with their expenses
export async function getAllReceipts(dateRange?: DateRange) {
  const conditions = dateRange
    ? and(
        gte(receipts.uploadedAt, dateRange.from),
        lte(receipts.uploadedAt, dateRange.to)
      )
    : undefined;

  const receiptsData = await db.query.receipts.findMany({
    where: conditions,
    with: {
      expenses: true,
    },
    orderBy: [desc(receipts.uploadedAt)],
  });

  return receiptsData;
}

// Get a single receipt with expenses
export async function getReceiptById(id: number) {
  const receipt = await db.query.receipts.findFirst({
    where: eq(receipts.id, id),
    with: {
      expenses: true,
    },
  });

  return receipt;
}
