import { GoogleGenAI } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';

    if (!lat || !lon) {
      return NextResponse.json({ error: "Missing location parameters" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // We construct a specific prompt asking for KVK data in JSON format
    const prompt = `You are an Indian agriculture assistant. Find the 3 closest Krishi Vigyan Kendras (KVKs) or major agricultural centers near:
Location details: Latitude ${lat}, Longitude ${lon}. City/District: ${city}, State: ${state}.

If you cannot determine the exact location, provide the 3 most prominent KVKs in the state of ${state || 'the given region'} or nearby regions.
For the "distance" field, estimate the distance in kilometers from the given city/coordinates (e.g. "12 km"). 
For "phone", provide a realistic KVK contact number (e.g., "+91 ..."). 
For "lat" and "lng", provide approximate coordinates for the center.

Respond ONLY with a valid JSON array of objects inside a "kvks" property.
Example format:
{
  "kvks": [
    {
      "name": "KVK Name",
      "address": "Full Address",
      "phone": "+91 9876543210",
      "distance": "15 km",
      "lat": 28.5355,
      "lng": 77.3910
    }
  ]
}
No other text or markdown block wrapping.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const data = JSON.parse(response.text || '{}');
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to fetch KVK data." }, { status: 500 });
  }
}
