// pages/api/web3/release-funds/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { ReleaseFundsMessageSchema } from "@/lib/web3/contract/types/eip712/ReleaseFundsMessageSchema";
import { IReleaseFunds } from "@/lib/web3/contract/types/eip712/IReleaseFunds";

// Define the API handler
export async function POST(req: Request) {
  try {
    // Parse and validate incoming data
    const body: IReleaseFunds = await req.json();

    // Validate the incoming data using Zod schema
    const parsed = ReleaseFundsMessageSchema.parse({
      ...body,
    });

    // Process the data (e.g., save to DB or release funds)
    // For now, let's simulate a successful processing
    return NextResponse.json({ message: "Funds successfully released", data: parsed });
  } catch (error) {
    // Handle validation or internal errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation failed", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
