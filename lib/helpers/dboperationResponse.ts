import { NextResponse } from "next/server";
import { consoleLog } from "@/lib/utils";

interface DbOperationResult {
  data?: unknown;
  error?: {
    message?: string;
    status?: number;
  };
}

export function dboperationResponse(
  result: DbOperationResult | null | undefined,
  operationName: string
) {
  consoleLog(`🔔 ☁️ API Route Ends (api/${operationName})`);

  if (!result || result.error) {
    const message =
      result?.error?.message ?? "Unknown server error";

    const status =
      result?.error?.status ?? 400;

    consoleLog("🔥 ❌ API Error:", message);

    return NextResponse.json(
      { error: message },
      { status }
    );
  }

  consoleLog("🔔 🔍 API Data:", result);

  return NextResponse.json(result, { status: 200 });
}
