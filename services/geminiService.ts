// services/geminiService.ts
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import {
  SYSTEM_PROMPT_CHAT,
  SYSTEM_PROMPT_BUILD,
  SYSTEM_PROMPT_DEBUG,
  GEMINI_MODEL,
  SYSTEM_PROMPT_TITLE_GENERATION,
} from "../constants";
import type { ChatMessage } from "../types";

/**
 * ===== Configuration =====
 * Put keys in `.env.local` at the project root:
 *
 *   VITE_GEMINI_API_KEY=your_gemini_or_cloud_api_key
 *   VITE_IMAGE_PROVIDER=HF            # or GOOGLE
 *   VITE_HF_TOKEN=hf_...              # required if VITE_IMAGE_PROVIDER=HF
 *   VITE_GOOGLE_API_KEY=AIza...       # optional; if omitted we reuse VITE_GEMINI_API_KEY
 *
 * Note: In a frontend-only app, these keys are visible to users. Use a backend
 * proxy for production to keep secrets safe.
 */
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const IMAGE_PROVIDER = (import.meta.env.VITE_IMAGE_PROVIDER || "GOOGLE").toString().toUpperCase();
const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;
const GOOGLE_API_KEY = (import.meta.env.VITE_GOOGLE_API_KEY as string | undefined) || GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;
let initializationError: string | null = null;

if (!GEMINI_API_KEY) {
  initializationError =
    "Gemini API key is not set. Add VITE_GEMINI_API_KEY to your .env.local and restart the dev server.";
  console.error(initializationError);
} else {
  try {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  } catch (err) {
    initializationError = `Failed to initialize GoogleGenAI: ${
      err instanceof Error ? err.message : String(err)
    }`;
    console.error(initializationError);
    ai = null;
  }
}

const ensureAiInitialized = (): GoogleGenAI => {
  if (!ai) throw new Error(initializationError || "Gemini client not initialized.");
  return ai;
};

export const getApiKeyStatus = (): { isConfigured: boolean; error: string | null } => ({
  isConfigured: !!ai,
  error: initializationError,
});

/* =========================
 * CHAT / BUILD / DEBUG
 * using @google/genai (text)
 * ========================= */
export const getChatResponseStream = async (history: ChatMessage[], message: string) => {
  const ai = ensureAiInitialized();
  const chat = ai.chats.create({
    model: GEMINI_MODEL,
    config: { systemInstruction: SYSTEM_PROMPT_CHAT },
    history: history.map((msg) => ({
      role: msg.sender === "user" ? "user" : "model",
      parts: [{ text: msg.text }],
    })),
  });
  return chat.sendMessageStream({ message });
};

export const generateChatTitle = async (firstUserMessage: string): Promise<string> => {
  try {
    const ai = ensureAiInitialized();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Generate a concise title for a chat that starts with: "${firstUserMessage}"`,
      config: { systemInstruction: SYSTEM_PROMPT_TITLE_GENERATION, thinkingConfig: { thinkingBudget: 0 } },
    });
    return response.text.trim().replace(/"/g, "");
  } catch (error) {
    console.error("Error generating title:", error);
    return "New Chat";
  }
};

export const buildCode = async (prompt: string): Promise<string> => {
  try {
    const ai = ensureAiInitialized();
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: { systemInstruction: SYSTEM_PROMPT_BUILD, thinkingConfig: { thinkingBudget: 0 } },
    });
    return response.text;
  } catch (error) {
    console.error("Error building code:", error);
    if (error instanceof Error) return `Error: ${error.message}`;
    return "Error: Could not generate code. See console for details.";
  }
};

export const debugCode = async (code: string, problem: string): Promise<string> => {
  try {
    const ai = ensureAiInitialized();
    const fullPrompt = `Here is the code:\n\n${code}\n\nHere is the problem description:\n\n${problem}`;
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: fullPrompt,
      config: { systemInstruction: SYSTEM_PROMPT_DEBUG },
    });
    return response.text;
  } catch (error) {
    console.error("Error debugging code:", error);
    if (error instanceof Error) return `Error: ${error.message}`;
    return "Error: Could not debug code. See console for details.";
  }
};

/* =========================
 * IMAGE GENERATION
 * Two providers supported:
 *  - GOOGLE (Imagen REST)
 *  - HF (Hugging Face Inference API)
 * Returns an array of base64-encoded PNGs (no data URL prefix).
 * ========================= */

/** Utility: convert ArrayBuffer -> base64 */
const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
};

/** Google Imagen REST */
const generateImageGoogle = async (prompt: string): Promise<string[]> => {
  if (!GOOGLE_API_KEY) {
    throw new Error("GOOGLE API key missing. Set VITE_GOOGLE_API_KEY or VITE_GEMINI_API_KEY in .env.local.");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/images:generate?key=${GOOGLE_API_KEY}`;
  const body = {
    // https://ai.google.dev/api/rest/v1beta/ImagesService/GenerateImages
    prompt: { text: prompt },
    aspectRatio: "1:1",
    // numberOfImages: 4, // uncomment if you want more than 1 (note: billing)
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Imagen API error (${res.status}): ${text}`);
  }

  const data = await res.json();
  const candidates = (data?.candidates || []) as Array<any>;
  const images = candidates
    .map((c) => c?.image?.base64 as string | undefined)
    .filter((b64): b64 is string => !!b64);

  if (!images.length) {
    throw new Error(
      "No images returned by Google Imagen. Your key/region may not support image gen. Switch VITE_IMAGE_PROVIDER=HF."
    );
  }

  return images;
};

/** Hugging Face Inference API (FLUX.1-dev) */
const generateImageHF = async (prompt: string): Promise<string[]> => {
  if (!HF_TOKEN) throw new Error("HF token missing. Add VITE_HF_TOKEN to .env.local.");
  const url = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${HF_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inputs: prompt }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Hugging Face error (${res.status}): ${text}`);
  }

  // HF returns binary image data; convert to base64 for <img src="data:image/png;base64,...">
  const buffer = await res.arrayBuffer();
  const base64 = arrayBufferToBase64(buffer);
  return [base64]; // usually one image
};

export const generateImage = async (prompt: string): Promise<string[]> => {
  const provider = IMAGE_PROVIDER;
  if (provider === "HF" || provider === "HUGGINGFACE") {
    return generateImageHF(prompt);
  }
  return generateImageGoogle(prompt); // default
};
