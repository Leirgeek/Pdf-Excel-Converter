import { NextResponse } from 'next/server';
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function POST(request: Request) {
  try {
    const { prompt, aspect_ratio } = await request.json();
    const output = await replicate.run("black-forest-labs/flux-1.1-pro-ultra", {
      input: {
        prompt,
        aspect_ratio: aspect_ratio || "3:2"
      }
    });
    return NextResponse.json({ success: true, output });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to generate image' }, { status: 500 });
  }
}