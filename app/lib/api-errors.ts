import { NextResponse } from 'next/server';

export interface ApiError {
  error: string;
}

// 共通のエラーレスポンス関数
export function createErrorResponse(message: string, status: number = 500): NextResponse {
  console.error(message);
  return NextResponse.json({ error: message }, { status });
}

export function createNotFoundResponse(resource: string): NextResponse {
  return createErrorResponse(`${resource}が見つかりません`, 404);
}

export function createValidationErrorResponse(message: string): NextResponse {
  return createErrorResponse(message, 400);
}
