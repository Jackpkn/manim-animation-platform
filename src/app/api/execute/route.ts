import { NextResponse } from 'next/server';
import { execManimCode } from '@/lib/docker';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const code = body.code;

        if (!code) {
            return NextResponse.json(
                { error: 'Code is required' },
                { status: 400 }
            );
        }

        // Generate a unique filename
        const filename = `${uuidv4()}.py`;
        const tmpDir = join(process.cwd(), 'tmp');
        const filepath = join(tmpDir, filename);

        // Ensure tmp directory exists
        await mkdir(tmpDir, { recursive: true });

        // Convert code to string and ensure it's valid
        let codeString: string;
        try {
            if (typeof code === 'string') {
                codeString = code;
            } else if (typeof code === 'object') {
                codeString = JSON.stringify(code, null, 2);
            } else {
                codeString = String(code);
            }

            // Ensure the code string is not empty
            if (!codeString.trim()) {
                return NextResponse.json(
                    { error: 'Code cannot be empty' },
                    { status: 400 }
                );
            }
        } catch (error) {
            console.error('Error processing code:', error);
            return NextResponse.json(
                { error: 'Invalid code format' },
                { status: 400 }
            );
        }

        // Write the code to file
        await writeFile(filepath, codeString, 'utf-8');

        // Execute the code using Docker
        const result = await execManimCode(filepath);

        if (result.error) {
            return NextResponse.json(
                { error: result.error },
                { status: 500 }
            );
        }

        // Return the video URL
        return NextResponse.json({
            videoUrl: result.videoUrl
        });
    } catch (error) {
        console.error('Error executing code:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to execute code' },
            { status: 500 }
        );
    }
} 