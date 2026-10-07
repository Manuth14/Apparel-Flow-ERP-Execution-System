import { NextResponse } from "next/server";

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
  }
}

export function errorResponse(e: unknown) {
  if (e instanceof ApiError) {
    return NextResponse.json({ error: e.message, details: e.details ?? null }, { status: e.status });
  }
  console.error(e);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
