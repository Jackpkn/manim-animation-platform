import { useState } from 'react';

interface CodeEditorProps {
    onRun: (code: string) => void;
    onSave: (code: string) => void;
}

export default function CodeEditor({ onRun, onSave }: CodeEditorProps) {
    const [code, setCode] = useState(`from manim import *

class MyAnimation(Scene):
    def construct(self):
        # Your animation code here
        circle = Circle()
        self.play(Create(circle))
        self.wait(1)`);

    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const handleAIGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);
        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ prompt }),
            });

            const data = await response.json();
            if (data.code) {
                setCode(data.code);
                // Automatically run the generated code
                onRun(data.code);
            }
        } catch (error) {
            console.error('Error generating code:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Code Editor
                </h2>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onRun(code)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Run Animation
                    </button>
                    <button
                        onClick={() => onSave(code)}
                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>

            {/* AI Prompt Input */}
            <div className="mb-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Describe the animation you want to create..."
                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    />
                    <button
                        onClick={handleAIGenerate}
                        disabled={isGenerating}
                        className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </button>
                </div>
            </div>

            <div className="relative">
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-[500px] p-4 font-mono text-sm bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Write your Manim code here..."
                />
            </div>
        </div>
    );
} 