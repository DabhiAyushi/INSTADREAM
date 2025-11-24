import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { receiptAnalysisSchema } from "@/lib/types";

if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
  throw new Error(
    "GOOGLE_GENERATIVE_AI_API_KEY environment variable is not set"
  );
}

// System prompt for receipt analysis
const RECEIPT_ANALYSIS_PROMPT = `You are an expert at analyzing receipts and categorizing expenses.

Analyze the receipt image and extract all expense items with the following information:
- Merchant/store name
- Individual item amounts (if visible) or total amount
- Date of purchase
- Brief description of items
- Category classification
- Currency (should be INR - Indian Rupees by default)

IMPORTANT: All amounts should be in Indian Rupees (INR). If the receipt shows a different currency, convert it to INR or default to INR.

Categorize each expense into one of these categories:
- food: Groceries, restaurants, cafes, food delivery
- lifestyle: Clothing, personal care, beauty, fitness, hobbies
- subscriptions: Recurring services (Netflix, Spotify, gym memberships, etc.)
- transportation: Gas, public transit, ride-sharing, parking, vehicle maintenance
- shopping: General retail, electronics, home goods, gifts
- entertainment: Movies, concerts, events, games, books
- utilities: Electricity, water, internet, phone bills
- healthcare: Medical, dental, pharmacy, insurance
- other: Anything that doesn't fit the above categories

Provide a confidence score (0-100) for your categorization.
If you cannot determine specific items, provide the total amount with the best matching category.

Return the data in the specified JSON format with currency set to "INR".`;

export async function analyzeReceipt(imageBase64: string) {
  try {
    const result = await generateObject({
      model: google("gemini-2.5-flash"),
      schema: receiptAnalysisSchema,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: RECEIPT_ANALYSIS_PROMPT },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    return result.object;
  } catch (error) {
    console.error("Error analyzing receipt with Gemini:", error);
    throw new Error("Failed to analyze receipt");
  }
}
