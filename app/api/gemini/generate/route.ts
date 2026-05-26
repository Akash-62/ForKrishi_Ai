import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { crop, language, problem, image } = await req.json();

    if (!problem && !image) {
      return NextResponse.json({ error: "Problem description or photo is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const problemText = problem ? problem : "(User uploaded a photo of their crop problem without text description)";

    const prompt = `You are ForKisan AI, a helpful, simple, and safe agricultural assistant for Indian farmers.
The farmer needs advice.
Language: ${language}
Crop: ${crop}
Problem: ${problemText}

Analyze the image (if provided) and the problem description to provide agricultural advice.
Respond with a JSON object ONLY. Do not use markdown wrapping around the JSON.
The JSON must have this exact structure:
{
  "severity": "Low" | "Medium" | "Serious",
  "problemSummary": "Short summary of what the problem likely is based on the visual and text inputs (max 2 sentences)",
  "doNow": ["Action 1", "Action 2"],
  "avoid": ["Things to avoid 1", "Things to avoid 2"],
  "contactOfficerIf": "When should they contact an agriculture officer?",
  "whatsappMessage": "A short message formatted for WhatsApp that they can forward to others for help. Include emojis if helpful here."
}

Ensure the language used in the values of the JSON matches the requested Language (${language}). Keep the tone extremely simple, respectful, and practical. Do not use technical jargon.`;

    let contents: any[] = [{ text: prompt }];

    if (image) {
      const match = image.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
      if (match) {
        contents.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const data = JSON.parse(text);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate advice. Please try again." }, { status: 500 });
  }
}
