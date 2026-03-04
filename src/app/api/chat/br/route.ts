import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // TODO: connect to the real CassisGPT-0.1-BR model
  const lastMessage = messages?.at(-1)?.content ?? "";
  return NextResponse.json({
    content: `[CassisGPT-0.1-BR] Você disse: "${lastMessage}"`,
  });
}
