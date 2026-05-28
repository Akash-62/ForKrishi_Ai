import { NextRequest, NextResponse } from "next/server";
import {
  createGeminiClient,
  GEMINI_MODEL,
  isRateLimited,
  limitedString,
  normalizeKvkPayload,
  parseJsonObject,
} from "@/lib/gemini-utils";

export async function GET(req: NextRequest) {
  try {
    if (isRateLimited(req, "gemini-kvk", 12)) {
      return NextResponse.json({ error: "Too many requests. Please wait and try again." }, { status: 429 });
    }

    const { searchParams } = new URL(req.url);
    const lat = Number(searchParams.get('lat'));
    const lon = Number(searchParams.get('lon'));
    const city = limitedString(searchParams.get('city'), 80);
    const state = limitedString(searchParams.get('state'), 80);

    if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const ai = createGeminiClient();
    if (!ai) {
      return NextResponse.json({ error: "Gemini API key is not configured" }, { status: 500 });
    }
    
    const prompt = `You are an Indian agriculture assistant. List up to 3 likely Krishi Vigyan Kendras (KVKs) or major public agricultural extension centers near:
Location details: Latitude ${lat}, Longitude ${lon}. City/District: ${city}, State: ${state}.

If you cannot determine the exact location, provide the 3 most prominent KVKs in the state of ${state || 'the given region'} or nearby regions.
For the "distance" field, estimate the distance in kilometers from the given city/coordinates (e.g., "12 km").
For "lat" and "lng", provide approximate coordinates for the center.
Do not invent phone numbers. The "phone" field must be null.
Prefer actual KVK names over generic agriculture office names. If uncertain, still keep phone null.

Respond ONLY with a valid JSON array of objects inside a "kvks" property.
Example format:
{
  "kvks": [
    {
      "name": "KVK Name",
      "address": "Full Address",
      "phone": null,
      "distance": "15 km",
      "lat": 28.5355,
      "lng": 77.3910
    }
  ]
}
No other text or markdown block wrapping.`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const parsed = parseJsonObject(response.text || '{}');
    const data = normalizeKvkPayload(parsed);
    if (!data) {
      return NextResponse.json({ error: "Gemini returned an invalid KVK format." }, { status: 502 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to fetch KVK data." }, { status: 500 });
  }
}
