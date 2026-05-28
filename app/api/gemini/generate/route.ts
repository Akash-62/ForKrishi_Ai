import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiClient,
  GEMINI_MODEL,
  GeminiPart,
  isRateLimited,
  limitedString,
  normalizeAdvisoryPayload,
  parseDataUrlImage,
  parseJsonObject,
} from "@/lib/gemini-utils";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, "gemini-generate", 12)) {
      return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
    }

    const body = await req.json();
    const crop = limitedString(body?.crop, 80, "Unknown crop");
    const language = limitedString(body?.language, 8, "en");
    const problem = limitedString(body?.problem, 2_000);
    const parsedImage = body?.image ? parseDataUrlImage(body.image) : null;

    if (body?.image && !parsedImage) {
      return NextResponse.json({ error: "Invalid or unsupported image data" }, { status: 400 });
    }

    if (!problem && !parsedImage) {
      return NextResponse.json({ error: "Problem description or photo is required" }, { status: 400 });
    }

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    
    const problemText = problem ? problem : "(User uploaded a photo of their crop problem without text description)";

    const prompt = `You are ForKisan AI, a helpful, simple, and safe agricultural assistant for Indian farmers.
The farmer needs advice.
Language: ${language}
Crop: ${crop}
Problem: ${problemText}

Analyze the image (if provided) and the problem description to provide agricultural advice.
Do not claim this is a confirmed diagnosis. For chemical treatments, keep advice cautious and tell the farmer to verify with a local agriculture officer or KVK before use.
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

    const contents: GeminiPart[] = [{ text: prompt }];

    if (parsedImage) {
      contents.push({
        inlineData: {
          mimeType: parsedImage.mimeType,
          data: parsedImage.data
        }
      });
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: {
        responseMimeType: "application/json",
      }
    });

    const text = response.text || "{}";
    const parsed = parseJsonObject(text);
    const data = normalizeAdvisoryPayload(parsed);
    if (!data) {
      return NextResponse.json({ error: "Gemini returned an invalid advisory format" }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini Error:", error);
    return NextResponse.json({ error: "Failed to generate advice. Please try again." }, { status: 500 });
  }
}
