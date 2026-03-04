import { NextRequest, NextResponse } from "next/server";

const MODAL_ENDPOINT =
  "https://c-vellames--arandu-1-serve-owt-aranduserver-instruct.modal.run";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const instruction: string = messages?.at(-1)?.content ?? "";

  try {
    const response = await fetch(MODAL_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instruction,
        max_tokens: 200,
        temperature: 0.7,
        top_p: 0.9,
        rep_penalty: 1.3,
      }),
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Model request failed" },
        { status: response.status }
      );
    }

    const data = await response.json();
    const content: string =
      data.response ?? data.content ?? data.text ?? data.output ?? "";

    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
