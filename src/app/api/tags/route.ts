import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags } from '@/db/schema';

// GET /api/tags - Pobierz wszystkie tagi
export async function GET() {
  try {
    const result = await db.select().from(tags);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać tagów' },
      { status: 500 }
    );
  }
}

// POST /api/tags - Utwórz nowy tag
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    // Walidacja
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nazwa jest wymagana i musi być tekstem' },
        { status: 400 }
      );
    }

    const [result] = await db.insert(tags).values({
      name: name.trim(),
    }).returning();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć tagu' },
      { status: 500 }
    );
  }
}