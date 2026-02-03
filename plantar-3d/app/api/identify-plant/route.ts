import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { huggingface } from "@ai-sdk/huggingface";
import { generateObject, generateText } from "ai";
import { z } from "zod";
import { auth } from "@/lib/auth";

const PlantIdentificationSchema = z.object({
  name: z.string().describe("Common name of the plant"),
  scientificName: z.string().describe("Scientific/botanical name of the plant"),
  description: z
    .string()
    .describe("Brief description of the plant (2-3 sentences)"),
  funFacts: z
    .array(z.string())
    .describe("3-5 interesting facts about the plant"),
  careInstructions: z
    .object({
      light: z.string().describe("Light requirements"),
      water: z.string().describe("Watering needs"),
      soil: z.string().describe("Soil preferences"),
      temperature: z.string().describe("Temperature range"),
    })
    .optional(),
  confidence: z
    .number()
    .min(0)
    .max(100)
    .describe("Confidence level of identification (0-100)"),
});

// Per-user rate limit tracking
const rateLimitMap = new Map<string, number>();
const RATE_LIMIT_MS = 2000;
const RATE_LIMIT_CLEANUP_INTERVAL = 60_000;
const REQUEST_TIMEOUT_MS = 60_000;

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, timestamp] of rateLimitMap) {
    if (now - timestamp > RATE_LIMIT_MS) {
      rateLimitMap.delete(key);
    }
  }
}, RATE_LIMIT_CLEANUP_INTERVAL);

const imageContent = (imageUrl: string) => {
  const isBase64 = imageUrl.startsWith("data:");
  return isBase64
    ? { type: "image" as const, image: imageUrl }
    : { type: "image" as const, image: new URL(imageUrl) };
};

const jsonSchema = JSON.stringify({
  name: "string (common name)",
  scientificName: "string (botanical name)",
  description: "string (2-3 sentences)",
  funFacts: ["string (3-5 interesting facts)"],
  careInstructions: {
    light: "string",
    water: "string",
    soil: "string",
    temperature: "string",
  },
  confidence: "number (0-100)",
});

const hfPrompt = `Identify this plant. Respond with ONLY valid JSON (no markdown, no code fences, no explanation). Use this exact schema:\n${jsonSchema}`;

const geminiPrompt =
  "Identify this plant and provide detailed information about it. If you cannot identify the plant with confidence, still provide your best guess but indicate a lower confidence score. Include care instructions if applicable. Return the response in the exact JSON schema format requested.";

function extractJSON(text: string): unknown {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const jsonStr = fenceMatch ? fenceMatch[1].trim() : text.trim();
  return JSON.parse(jsonStr);
}

type Provider = {
  name: string;
  identify: (
    imageUrl: string
  ) => Promise<z.infer<typeof PlantIdentificationSchema>>;
};

const providers: Provider[] = [
  {
    name: "HuggingFace",
    identify: async (imageUrl) => {
      const { text } = await generateText({
        model: huggingface("Qwen/Qwen2.5-VL-7B-Instruct"),
        maxRetries: 1,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: hfPrompt },
              imageContent(imageUrl),
            ],
          },
        ],
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      const raw = extractJSON(text);
      return PlantIdentificationSchema.parse(raw);
    },
  },
  {
    name: "Gemini",
    identify: async (imageUrl) => {
      const { object } = await generateObject({
        model: google("gemini-2.0-flash"),
        schema: PlantIdentificationSchema,
        maxRetries: 1,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: geminiPrompt },
              imageContent(imageUrl),
            ],
          },
        ],
        abortSignal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      return object;
    },
  },
];

async function identifyPlant(imageUrl: string) {
  let lastError: unknown;

  for (const provider of providers) {
    try {
      const result = await provider.identify(imageUrl);
      return { result, provider: provider.name };
    } catch (error) {
      console.error(`${provider.name} failed:`, error);
      lastError = error;
    }
  }

  throw lastError;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id ?? session.user.email ?? "anonymous";

    const body = await request.json();
    const { imageUrl } = body;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Per-user rate limit check
    const now = Date.now();
    const lastRequest = rateLimitMap.get(userId) ?? 0;
    if (now - lastRequest < RATE_LIMIT_MS) {
      const waitTime = Math.ceil(
        (RATE_LIMIT_MS - (now - lastRequest)) / 1000
      );
      return NextResponse.json(
        {
          error: `Please wait ${waitTime} seconds between requests.`,
          retryAfter: waitTime,
          isRateLimited: true,
        },
        { status: 429 }
      );
    }
    rateLimitMap.set(userId, now);

    const { result: plant, provider } = await identifyPlant(imageUrl);

    return NextResponse.json({ ...plant, provider });
  } catch (error) {
    console.error("Plant identification error:", error);

    const errorMessage =
      error instanceof Error ? error.message : String(error);

    if (
      errorMessage.includes("429") ||
      errorMessage.includes("rate") ||
      errorMessage.includes("limit")
    ) {
      return NextResponse.json(
        {
          error: "Rate limit reached. Please wait a moment and try again.",
          retryAfter: 10,
          isRateLimited: true,
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Failed to identify plant. Please try again." },
      { status: 500 }
    );
  }
}
