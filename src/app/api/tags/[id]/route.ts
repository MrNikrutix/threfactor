import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tags, exercise_tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/tags/[id] - Pobierz tag po ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID tagu' },
        { status: 400 }
      );
    }

    const [result] = await db.select().from(tags).where(eq(tags.id, id));

    if (!result) {
      return NextResponse.json(
        { error: 'Tag nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać tagu' },
      { status: 500 }
    );
  }
}

// PUT /api/tags/[id] - Zaktualizuj tag
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID tagu' },
        { status: 400 }
      );
    }

    // Walidacja
    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Nazwa jest wymagana i musi być tekstem' },
        { status: 400 }
      );
    }

    const [result] = await db
      .update(tags)
      .set({ name: name.trim() })
      .where(eq(tags.id, id))
      .returning();

    if (!result) {
      return NextResponse.json(
        { error: 'Tag nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Nie udało się zaktualizować tagu' },
      { status: 500 }
    );
  }
}

// DELETE /api/tags/[id] - Usuń tag
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID tagu' },
        { status: 400 }
      );
    }

    // Usuń powiązania z ćwiczeniami
    await db.delete(exercise_tags).where(eq(exercise_tags.tag_id, id));

    // Usuń tag
    const [result] = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning();

    if (!result) {
      return NextResponse.json(
        { error: 'Tag nie został znaleziony' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Tag został usunięty' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć tagu' },
      { status: 500 }
    );
  }
}