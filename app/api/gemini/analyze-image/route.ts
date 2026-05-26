import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { crop, language, image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const isCropDetection = !crop;
    let prompt = "";
    
    if (isCropDetection) {
      prompt = `You are a crop classifier. The farmer uploaded a photo of their crop leaf.
Identify which crop this leaf belongs to. Choose the crop species ONLY from this list: "Tomato", "Paddy", "Ragi", "Chilli", "Maize". If it is none of these, choose "Other".
Return a JSON object in this exact format:
{
  "detectedCrop": "Tomato" | "Paddy" | "Ragi" | "Chilli" | "Maize" | "Other",
  "confidence": number,
  "explanation": "1-sentence visual description of the crop leaf in ${language}"
}
Do not include markdown code blocks (no \`\`\`json or \`\`\`). Return raw JSON only.`;
    } else {
      prompt = `You are a crop health identifier. The farmer uploaded a photo of their ${crop}.
Language: ${language}.
Analyze the image and provide a very short, preliminary visual diagnosis (1-2 sentences) of what the problem appears to be visually. Keep it simple, respectful, and helpful.`;
    }

    let contents: any[] = [{ text: prompt }];

    const match = image.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (match) {
      contents.push({
        inlineData: {
          mimeType: match[1],
          data: match[2]
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid image data" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
    });

    const responseText = response.text || "";

    if (isCropDetection) {
      try {
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        return NextResponse.json(parsed);
      } catch (jsonErr) {
        console.error("Failed to parse crop detection response", responseText, jsonErr);
        return NextResponse.json({ detectedCrop: "Other", confidence: 0.5, explanation: "Could not classify crop visual." });
      }
    }

    return NextResponse.json({ diagnosis: responseText });
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze image." }, { status: 500 });
  }
}
