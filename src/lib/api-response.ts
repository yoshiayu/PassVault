import { NextResponse } from "next/server";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ code: "OK", message: "ok", data }, init);
}

export function error(code: string, message: string, status = 400, details?: unknown) {
  return NextResponse.json({ code, message, details }, { status });
}
