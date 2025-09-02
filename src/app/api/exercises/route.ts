import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises, exercise_tags, tags } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/exercises - Pobierz wszystkie ćwiczenia
export async function GET() {
  try {
    const result = await db
      .select({
        id: exercises.id,
        name: exercises.name,
        instructions: exercises.instructions,
        enrichment: exercises.enrichment,
        videoUrl: exercises.videoUrl,
        crop_id: exercises.crop_id,
      })
      .from(exercises);

    // Pobierz tagi dla każdego ćwiczenia
    const exercisesWithTags = await Promise.all(
      result.map(async (exercise) => {
        const exerciseTags = await db
          .select({
            id: tags.id,
            name: tags.name,
          })
          .from(tags)
          .innerJoin(exercise_tags, eq(tags.id, exercise_tags.tag_id))
          .where(eq(exercise_tags.exercise_id, exercise.id));

        return {
          ...exercise,
          tags: exerciseTags,
        };
      })
    );

    return NextResponse.json(exercisesWithTags);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać ćwiczeń' },
      { status: 500 }
    );
  }
}

// POST /api/exercises - Utwórz nowe ćwiczenie
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, instructions, enrichment, videoUrl, crop_id, tag_ids } = body;

    // Walidacja
    if (!name) {
      return NextResponse.json(
        { error: 'Nazwa jest wymagana' },
        { status: 400 }
      );
    }

    // Utwórz ćwiczenie
    const [exercise] = await db.insert(exercises).values({
      name,
      instructions,
      enrichment,
      videoUrl,
      crop_id,
    }).returning();

    // Dodaj tagi jeśli zostały podane
    if (tag_ids && Array.isArray(tag_ids)) {
      for (const tagId of tag_ids) {
        // Sprawdź czy tag istnieje
        const [tag] = await db.select().from(tags).where(eq(tags.id, tagId));
        if (tag) {
          await db.insert(exercise_tags).values({
            exercise_id: exercise.id,
            tag_id: tagId,
          });
        }
      }
    }

    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { error: 'Nie udało się utworzyć ćwiczenia' },
      { status: 500 }
    );
  }
}