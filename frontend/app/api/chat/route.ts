import { GoogleGenAI } from "@google/genai";
import { NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const message = body.message;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
You are R.E.A.C.T AI.

User message:
${message}

Provide a professional railway emergency response.
`,
    });
    console.log("Gemini Response:");
    console.log(response.text);

    return NextResponse.json({
      reply: response.text,
      toolEvents: [],
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        reply: "Failed to contact Gemini.",
      },
      { status: 500 }
    );
  }
}