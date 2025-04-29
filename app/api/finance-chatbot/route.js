import { NextResponse } from "next/server";
import { evaluate } from "mathjs";

export async function POST(req) {
  const { message } = await req.json();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not set." }, { status: 500 });
  }

  // System prompt to restrict Gemini to financial calculations only
  const systemPrompt = `You are FinanceBot, an expert in finance and financial calculations. Only answer questions related to finance, money, investments, interest, budgeting, and financial math. If a question is not related to finance or calculations, politely refuse.`;

  // --- Calculation Intercept ---
  // Regex to check if message is a pure calculation (numbers, operators, parens, decimals, spaces)
  const calcPattern = /^[0-9+\-*/().%^\s]+$/;
  if (calcPattern.test(message.trim())) {
    try {
      // Evaluate and return result
      const result = evaluate(message);
      return NextResponse.json({ answer: `Result: ${result}` });
    } catch (err) {
      return NextResponse.json({ answer: "Sorry, I couldn't compute that expression." });
    }
  }
  // --- End Calculation Intercept ---

  // Compose the message as in your curl example
  const combinedMessage = `${systemPrompt}\n\nUser question: ${message}`;
  const payload = {
    contents: [
      {
        parts: [
          { text: combinedMessage }
        ]
      }
    ]
  };

  try {
    // Use the exact endpoint and payload format as your curl
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      }
    );

    const text = await geminiRes.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      return NextResponse.json({ error: `Gemini API returned non-JSON: ${text}` }, { status: 500 });
    }

    if (!geminiRes.ok) {
      return NextResponse.json({ error: data.error?.message || text }, { status: 500 });
    }

    let answer = "Sorry, I couldn't process that.";
    if (data && data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        answer = candidate.content.parts[0].text;
      } else if (candidate.error) {
        answer = `Error from AI: ${candidate.error.message}`;
      }
    } else if (data.error) {
      answer = `API Error: ${data.error.message}`;
    }

    return NextResponse.json({ answer });
  } catch (err) {
    return NextResponse.json({ error: "Failed to contact Gemini API: " + err.message }, { status: 500 });
  }
}
