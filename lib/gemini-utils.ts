import { GoogleGenAI } from "@google/genai";
import type { NextRequest } from "next/server";

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash";

export type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

export interface ParsedDataUrlImage {
  mimeType: string;
  data: string;
  byteLength: number;
}

export interface AdvisoryPayload {
  severity: "Low" | "Medium" | "Serious";
  problemSummary: string;
  doNow: string[];
  avoid: string[];
  contactOfficerIf: string;
  whatsappMessage: string;
}

export interface CropDetectionPayload {
  detectedCrop: string;
  confidence: number;
  explanation: string;
}

export interface KVKPayload {
  name: string;
  address: string;
  phone: null;
  distance?: string;
  lat?: number;
  lng?: number;
}

const allowedImageTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

const allowedCrops = new Set(["Tomato", "Paddy", "Ragi", "Chilli", "Maize", "Other"]);
const allowedSeverities = new Set(["Low", "Medium", "Serious"]);
const hitBuckets = new Map<string, { count: number; resetAt: number }>();

export function createGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

export function isRateLimited(req: NextRequest, bucketName: string, limit = 20, windowMs = 60_000) {
  const forwardedFor = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientId = forwardedFor || req.headers.get("x-real-ip") || "local";
  const key = `${bucketName}:${clientId}`;
  const now = Date.now();
  const bucket = hitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    hitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }

  if (bucket.count >= limit) {
    return true;
  }

  bucket.count += 1;
  return false;
}

export function limitedString(value: unknown, maxLength: number, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : fallback;
}

export function parseDataUrlImage(value: unknown, maxBytes = 4 * 1024 * 1024): ParsedDataUrlImage | null {
  if (typeof value !== "string" || value.length > maxBytes * 1.45 + 128) {
    return null;
  }

  const match = value.match(/^data:(image\/[a-zA-Z0-9-.+]+);base64,([A-Za-z0-9+/=\s]+)$/);
  if (!match) {
    return null;
  }

  const mimeType = match[1].toLowerCase();
  if (!allowedImageTypes.has(mimeType)) {
    return null;
  }

  const data = match[2].replace(/\s/g, "");
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data)) {
    return null;
  }

  const padding = data.endsWith("==") ? 2 : data.endsWith("=") ? 1 : 0;
  const byteLength = Math.floor((data.length * 3) / 4) - padding;
  if (byteLength <= 0 || byteLength > maxBytes) {
    return null;
  }

  return { mimeType, data, byteLength };
}

export function parseJsonObject(text: string): Record<string, unknown> | null {
  let clean = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const start = clean.indexOf("{");
  const end = clean.lastIndexOf("}");
  if (start !== -1 && end > start) {
    clean = clean.slice(start, end + 1);
  }

  try {
    const parsed = JSON.parse(clean);
    return isRecord(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function normalizeAdvisoryPayload(value: unknown): AdvisoryPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const severity = allowedSeverities.has(String(value.severity)) ? String(value.severity) : "Medium";
  const problemSummary = limitedString(value.problemSummary, 320);
  const doNow = limitedStringArray(value.doNow, 6);
  const avoid = limitedStringArray(value.avoid, 6);
  const contactOfficerIf = limitedString(value.contactOfficerIf, 300);
  const whatsappMessage = limitedString(value.whatsappMessage, 900);

  if (!problemSummary) {
    return null;
  }

  return {
    severity: severity as AdvisoryPayload["severity"],
    problemSummary,
    doNow: doNow.length ? doNow : ["Monitor the crop closely and avoid chemical treatment until symptoms are confirmed."],
    avoid: avoid.length ? avoid : ["Do not mix pesticides or increase dosage without expert advice."],
    contactOfficerIf: contactOfficerIf || "Contact a local agriculture officer if symptoms spread or yield is at risk.",
    whatsappMessage: whatsappMessage || problemSummary,
  };
}

export function normalizeCropDetectionPayload(value: unknown): CropDetectionPayload | null {
  if (!isRecord(value)) {
    return null;
  }

  const detectedCrop = value.detectedCrop ? String(value.detectedCrop) : "Other";
  const rawConfidence = typeof value.confidence === "number" ? value.confidence : Number(value.confidence);
  const confidence = Number.isFinite(rawConfidence) ? Math.max(0, Math.min(1, rawConfidence)) : 0;
  const explanation = limitedString(value.explanation, 240, "Could not classify crop visual.");

  return {
    detectedCrop,
    confidence,
    explanation,
  };
}

export function normalizeKvkPayload(value: unknown): { kvks: KVKPayload[] } | null {
  if (!isRecord(value) || !Array.isArray(value.kvks)) {
    return null;
  }

  const kvks = value.kvks
    .map((item) => {
      if (!isRecord(item)) {
        return null;
      }

      const name = limitedString(item.name, 160);
      const address = limitedString(item.address, 260);
      if (!name || !address) {
        return null;
      }

      const lat = finiteCoordinate(item.lat, -90, 90);
      const lng = finiteCoordinate(item.lng, -180, 180);
      const distance = limitedString(item.distance, 40);

      return {
        name,
        address,
        phone: null,
        ...(distance ? { distance } : {}),
        ...(lat !== null ? { lat } : {}),
        ...(lng !== null ? { lng } : {}),
      };
    })
    .filter((item): item is KVKPayload => Boolean(item))
    .slice(0, 3);

  return kvks.length ? { kvks } : null;
}

function limitedStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => limitedString(item, 240))
    .filter(Boolean)
    .slice(0, maxItems);
}

function finiteCoordinate(value: unknown, min: number, max: number) {
  const parsed = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < min || parsed > max) {
    return null;
  }
  return parsed;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
