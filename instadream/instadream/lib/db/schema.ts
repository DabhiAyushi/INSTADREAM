import { pgTable, serial, text, timestamp, decimal, integer, boolean, json } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ========================================
// CASHLY TABLES (Receipt tracking)
// ========================================
export const receipts = pgTable('receipts', {
  id: serial('id').primaryKey(),
  imageUrl: text('image_url'),
  uploadedAt: timestamp('uploaded_at').defaultNow().notNull(),
  processedAt: timestamp('processed_at'),
  status: text('status', { enum: ['pending', 'processed', 'failed'] }).default('pending').notNull(),
});

export const expenses = pgTable('expenses', {
  id: serial('id').primaryKey(),
  receiptId: integer('receipt_id').references(() => receipts.id).notNull(),
  merchantName: text('merchant_name'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('INR').notNull(),
  category: text('category', {
    enum: [
      'food',
      'lifestyle',
      'subscriptions',
      'transportation',
      'shopping',
      'entertainment',
      'utilities',
      'healthcare',
      'other'
    ]
  }).notNull(),
  date: timestamp('date'),
  description: text('description'),
  confidence: decimal('confidence', { precision: 5, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// TUDU TABLES (Todo management)
// ========================================
export const todos = pgTable('todos', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  dueDate: timestamp('due_date'),
  priority: text('priority', { enum: ['high', 'medium', 'low', 'none'] }).default('none').notNull(),
  category: text('category'),
  tags: json('tags').$type<string[]>(),
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurrencePattern: text('recurrence_pattern'),
  isCompleted: boolean('is_completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const todoChecklistItems = pgTable('todo_checklist_items', {
  id: serial('id').primaryKey(),
  todoId: integer('todo_id').references(() => todos.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  isCompleted: boolean('is_completed').default(false).notNull(),
  order: integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const todoAttachments = pgTable('todo_attachments', {
  id: serial('id').primaryKey(),
  todoId: integer('todo_id').references(() => todos.id, { onDelete: 'cascade' }).notNull(),
  type: text('type', { enum: ['note', 'file'] }).notNull(),
  content: text('content').notNull(),
  fileName: text('file_name'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// ========================================
// INSTADREAM TABLES (Instagram AI posts)
// ========================================
export const generatedPosts = pgTable('generated_posts', {
  id: serial('id').primaryKey(),
  prompt: text('prompt').notNull(),
  caption: text('caption'),
  imageUrl: text('image_url'),
  storageKey: text('storage_key'),
  referenceImageUrl: text('reference_image_url'),
  referenceStorageKey: text('reference_storage_key'),
  modelUsed: text('model_used').notNull(),
  status: text('status', { enum: ['pending', 'generating', 'completed', 'failed'] }).default('pending').notNull(),
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// ========================================
// RELATIONS
// ========================================

// Cashly Relations
export const receiptsRelations = relations(receipts, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  receipt: one(receipts, {
    fields: [expenses.receiptId],
    references: [receipts.id],
  }),
}));

// Tudu Relations
export const todosRelations = relations(todos, ({ many }) => ({
  checklistItems: many(todoChecklistItems),
  attachments: many(todoAttachments),
}));

export const todoChecklistItemsRelations = relations(todoChecklistItems, ({ one }) => ({
  todo: one(todos, {
    fields: [todoChecklistItems.todoId],
    references: [todos.id],
  }),
}));

export const todoAttachmentsRelations = relations(todoAttachments, ({ one }) => ({
  todo: one(todos, {
    fields: [todoAttachments.todoId],
    references: [todos.id],
  }),
}));
