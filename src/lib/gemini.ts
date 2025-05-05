import axios from "axios";

// Replace with your actual API key
const API_KEY = process.env.GEMINI_API_KEY;
const API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export async function generateManimCode(prompt: string): Promise<string> {
  if (!API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  const systemPrompt = `You are a Manim animation expert. Generate Python code using the Manim library based on the user's description. 
  Only return the Python code, no explanations or markdown formatting. The code should be a complete, runnable Manim animation.`;

  try {
    const response = await axios.post(
      `${API_URL}?key=${API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\nUser request: ${prompt}`
          }]
        }]
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
      throw new Error('Invalid response from Gemini API');
    }

    const generatedText = response.data.candidates[0].content.parts[0].text;

    // Extract code from the response
    const codeMatch = generatedText.match(/```python\n([\s\S]*?)\n```/) ||
      generatedText.match(/```\n([\s\S]*?)\n```/) ||
      [null, generatedText];

    // Add dark background configuration if not present
    let code = codeMatch[1] || generatedText;
    if (!code.includes('config.background_color')) {
      code = `from manim import *\n\n# Set dark background\nconfig.background_color = "#1C1C1C"\n\n${code}`;
    }

    return code;
  } catch (error) {
    console.error("Error generating Manim code:", error);
    if (axios.isAxiosError(error)) {
      throw new Error(`Gemini API error: ${error.response?.data?.error?.message || error.message}`);
    }
    throw error;
  }
}
