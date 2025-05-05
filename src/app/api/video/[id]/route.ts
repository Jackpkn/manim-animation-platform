import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        // The id parameter is the scene name
        const sceneName = params.id;

        // Construct the video path - Manim outputs to media/videos/[scene_name]/720p30/output.mp4
        const videoPath = join(
            process.cwd(),
            'media',
            'videos',
            sceneName,
            '720p30',
            'output.mp4'
        );

        console.log('Attempting to read video from:', videoPath);

        const videoBuffer = await readFile(videoPath);

        return new NextResponse(videoBuffer, {
            headers: {
                'Content-Type': 'video/mp4',
                'Content-Length': videoBuffer.length.toString(),
            },
        });
    } catch (error) {
        console.error('Error serving video:', error);
        return NextResponse.json(
            { error: 'Failed to serve video', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
} 