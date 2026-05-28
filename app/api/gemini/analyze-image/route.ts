import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiClient,
  GEMINI_MODEL,
  GeminiPart,
  isRateLimited,
  limitedString,
  normalizeCropDetectionPayload,
  parseDataUrlImage,
  parseJsonObject,
} from "@/lib/gemini-utils";

export async function POST(req: NextRequest) {
  try {
    if (isRateLimited(req, "gemini-analyze-image", 18)) {
      return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
    }

    const body = await req.json();
    const crop = limitedString(body?.crop, 80);
    const language = limitedString(body?.language, 8, "en");
    const parsedImage = parseDataUrlImage(body?.image);

    if (!parsedImage) {
      return NextResponse.json({ error: "Image is required" }, { status: 400 });
    }

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    
    const isCropDetection = !crop;
    let prompt = "";
    
    if (isCropDetection) {
      prompt = `You are a crop classifier. The farmer uploaded a photo of their crop leaf.
Identify which crop this leaf belongs to. If the crop is one of "Tomato", "Paddy", "Ragi", "Chilli", or "Maize", return that exact name. Otherwise, identify the specific crop species (e.g., "Lemon", "Mango", "Cotton", "Groundnut", etc.) and return its name. If you cannot identify the leaf at all, return "Other".
Return a JSON object in this exact format:
{
  "detectedCrop": string,
  "confidence": number,
  "explanation": "1-sentence visual description of the crop leaf in ${language}"
}
Do not include markdown code blocks (no \`\`\`json or \`\`\`). Return raw JSON only.`;
    } else {
      prompt = `You are a crop health identifier. The farmer uploaded a photo of their ${crop}.
Language: ${language}.
Analyze the image and provide a very short, preliminary visual diagnosis (1-2 sentences) of what the problem appears to be visually. Keep it simple, respectful, and helpful.`;
    }

    const contents: GeminiPart[] = [
      { text: prompt },
      {
        inlineData: {
          mimeType: parsedImage.mimeType,
          data: parsedImage.data
        }
      }
    ];

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: contents,
      config: isCropDetection ? { responseMimeType: "application/json" } : undefined,
    });

    const responseText = response.text || "";

    if (isCropDetection) {
      try {
        console.log("Gemini Raw Response:", responseText);
        const cleanJson = responseText.replace(/```json/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleanJson);
        const data = normalizeCropDetectionPayload(parsed);
        if (!data) {
          console.error("Failed to parse crop detection response", responseText);
          return NextResponse.json({ detectedCrop: "Other", confidence: 0.5, explanation: "Could not classify crop visual." });
        }
        return NextResponse.json(data);
      } catch (jsonErr) {
        console.error("Failed to parse crop detection response", responseText, jsonErr);
        return NextResponse.json({ detectedCrop: "Other", confidence: 0.5, explanation: "Could not classify crop visual." });
      }
    }

    return NextResponse.json({ diagnosis: limitedString(responseText, 700, "Could not analyze the image clearly.") });
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    return NextResponse.json({ error: "Failed to analyze image." }, { status: 500 });
  }
}
