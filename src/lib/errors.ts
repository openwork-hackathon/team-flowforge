import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation Error',
        code: 'VALIDATION_ERROR',
        details: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        code: error.code || 'API_ERROR',
      },
      { status: error.statusCode }
    );
  }

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return NextResponse.json(
          {
            error: 'A record with this value already exists',
            code: 'DUPLICATE_ERROR',
          },
          { status: 409 }
        );
      case 'P2025':
        return NextResponse.json(
          {
            error: 'Record not found',
            code: 'NOT_FOUND',
          },
          { status: 404 }
        );
      default:
        return NextResponse.json(
          {
            error: 'Database error',
            code: `DB_ERROR_${error.code}`,
          },
          { status: 500 }
        );
    }
  }

  // Generic errors
  const message = error instanceof Error ? error.message : 'An unexpected error occurred';
  return NextResponse.json(
    {
      error: message,
      code: 'INTERNAL_ERROR',
    },
    { status: 500 }
  );
}
