import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { receipts, expenses } from '@/lib/db/schema';
import { analyzeReceipt } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  try {
    // Get the uploaded image from form data
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, or WebP image.' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // Convert image to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');
    const imageDataUrl = `data:${file.type};base64,${base64Image}`;

    // Create receipt record in database
    const [receipt] = await db
      .insert(receipts)
      .values({
        status: 'pending',
        imageUrl: null, // You can store the image in cloud storage and save URL here
      })
      .returning();

    try {
      // Analyze receipt with Gemini AI
      const analysis = await analyzeReceipt(imageDataUrl);

      // Insert expenses into database
      const expenseRecords = await db
        .insert(expenses)
        .values(
          analysis.expenses.map((expense) => ({
            receiptId: receipt.id,
            merchantName: expense.merchantName || analysis.merchantName || null,
            amount: expense.amount.toString(),
            currency: expense.currency,
            category: expense.category,
            date: expense.date ? new Date(expense.date) : analysis.receiptDate ? new Date(analysis.receiptDate) : null,
            description: expense.description || null,
            confidence: expense.confidence?.toString() || null,
          }))
        )
        .returning();

      // Update receipt status to processed
      await db
        .update(receipts)
        .set({
          status: 'processed',
          processedAt: new Date(),
        })
        .where(eq(receipts.id, receipt.id));

      return NextResponse.json({
        success: true,
        receiptId: receipt.id,
        analysis: {
          expenses: expenseRecords.map((exp) => ({
            id: exp.id,
            merchantName: exp.merchantName,
            amount: parseFloat(exp.amount),
            currency: exp.currency,
            category: exp.category,
            date: exp.date,
            description: exp.description,
            confidence: exp.confidence ? parseFloat(exp.confidence) : null,
          })),
          totalAmount: analysis.totalAmount,
          currency: analysis.currency,
          merchantName: analysis.merchantName,
          receiptDate: analysis.receiptDate,
        },
      });
    } catch (aiError) {
      // Update receipt status to failed
      await db
        .update(receipts)
        .set({
          status: 'failed',
        })
        .where(eq(receipts.id, receipt.id));

      console.error('AI analysis error:', aiError);
      return NextResponse.json(
        { error: 'Failed to analyze receipt. Please try again.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Receipt analysis error:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing the receipt.' },
      { status: 500 }
    );
  }
}
