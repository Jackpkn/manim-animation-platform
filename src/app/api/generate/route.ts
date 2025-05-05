import { NextResponse } from 'next/server';
import { generateManimCode } from '@/lib/gemini';

export async function POST(request: Request) {
    try {
        const { prompt } = await request.json();

        if (!prompt) {
            return NextResponse.json(
                { error: 'Prompt is required' },
                { status: 400 }
            );
        }

        const code = await generateManimCode(prompt);

        return NextResponse.json({ code });
    } catch (error) {
        console.error('Error generating code:', error);
        return NextResponse.json(
            { error: 'Failed to generate code' },
            { status: 500 }
        );
    }
} 