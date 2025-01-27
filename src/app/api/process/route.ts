import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { DocumentSchema } from '@/lib/schema';

const openai = new OpenAI();

const systemPrompt = `You are an expert at extracting structured information from documents.
Extract the following information in JSON format:
{
  "company": "Company name (string)",
  "address": "Company address (string)",
  "total_sum": "Total sum of purchase (string with currency)",
  "items": [
    {
      "item": "Item name (string)",
      "unit_price": "Unit price (string with currency)",
      "quantity": "Quantity (string)",
      "sum": "Sum for this item (string with currency)"
    }
  ]
}

If any field is not found in the text, use "N/A" as the value.
Make sure all numerical values are extracted as strings with their currency symbols if present.
The response must be valid JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { texts } = await req.json();

    if (!Array.isArray(texts) || texts.length === 0) {
      return NextResponse.json(
        { error: 'No texts provided' },
        { status: 400 }
      );
    }

    // Process each document with OpenAI
    const results = await Promise.all(
      texts.map(async (text) => {
        try {
          const completion = await openai.chat.completions.create({
            model: "gpt-4",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: text },
            ],
            response_format: { type: "json_object" },
          });

          const parsedData = JSON.parse(completion.choices[0].message.content);
          const validatedData = DocumentSchema.parse(parsedData);

          return {
            success: true,
            data: validatedData,
          };
        } catch (error) {
          console.error('Error processing document:', error);
          return {
            success: false,
            error: 'Failed to process document',
          };
        }
      })
    );

    // Check if any processing failed
    const errors = results.filter(result => !result.success);
    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Some documents failed to process', details: errors },
        { status: 500 }
      );
    }

    // Return the processed data
    return NextResponse.json({
      data: results.map(result => result.data),
    });
  } catch (error) {
    console.error('Error in process route:', error);
    return NextResponse.json(
      { error: 'Failed to process documents' },
      { status: 500 }
    );
  }
}
