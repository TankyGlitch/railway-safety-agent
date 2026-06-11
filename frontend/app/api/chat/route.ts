import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: body.message,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(text);
    }

    const data = await response.json();

    return NextResponse.json({
      reply: data.reply,
      toolEvents: [],
    });

  } catch (error) {
    console.error("Backend Error:", error);

    return NextResponse.json(
      {
        reply: "Failed to contact R.E.A.C.T AI backend.",
      },
      { status: 500 }
    );
  }
}