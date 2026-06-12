import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/system-prompt";

// Per-IP rate limit (per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW = 60 * 1000;

// Per-IP daily limit
const dailyLimitMap = new Map<string, { count: number; date: string }>();
const DAILY_LIMIT = 25;

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

function isDailyLimitReached(ip: string): boolean {
  const today = getToday();
  const entry = dailyLimitMap.get(ip);
  if (!entry || entry.date !== today) {
    dailyLimitMap.set(ip, { count: 1, date: today });
    return false;
  }
  if (entry.count >= DAILY_LIMIT) return true;
  entry.count++;
  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment." },
        { status: 429 },
      );
    }

    if (isDailyLimitReached(ip)) {
      return NextResponse.json(
        { error: "You've reached the daily chat limit. Come back tomorrow!" },
        { status: 429 },
      );
    }

    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format." },
        { status: 400 },
      );
    }

    const recentMessages = messages.slice(-10);

    for (const msg of recentMessages) {
      if (typeof msg.content === "string" && msg.content.length > 2000) {
        return NextResponse.json(
          {
            error:
              "Message too long. Please keep messages under 2000 characters.",
          },
          { status: 400 },
        );
      }
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Chat is not configured." },
        { status: 500 },
      );
    }

    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            { role: "system", content: buildSystemPrompt() },
            ...recentMessages,
          ],
          max_tokens: 512,
          temperature: 0.7,
          stream: false,
        }),
      },
    );

    if (!response.ok) {
      const error = await response.text();
      console.error("Groq API error:", error);
      return NextResponse.json(
        { error: "Failed to get a response. Try again." },
        { status: response.status },
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? "";

    return NextResponse.json({ message: content });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Try again." },
      { status: 500 },
    );
  }
}