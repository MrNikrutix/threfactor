import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises, exercise_tags, tags, cropped_videos, annotations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { unlink } from 'fs/promises';
import { join } from 'path';

// GET /api/exercises/[id] - Pobierz ćwiczenie po ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID ćwiczenia' },
        { status: 400 }
      );
    }

    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));

    if (!exercise) {
      return NextResponse.json(
        { error: 'Ćwiczenie nie zostało znalezione' },
        { status: 404 }
      );
    }

    // Pobierz tagi dla ćwiczenia
    const exerciseTags = await db
      .select({
        id: tags.id,
        name: tags.name,
      })
      .from(tags)
      .innerJoin(exercise_tags, eq(tags.id, exercise_tags.tag_id))
      .where(eq(exercise_tags.exercise_id, id));

    return NextResponse.json({
      ...exercise,
      tags: exerciseTags,
    });
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { error: 'Nie udało się pobrać ćwiczenia' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Zaktualizuj ćwiczenie
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { name, instructions, enrichment, videoUrl, crop_id, tag_ids } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID ćwiczenia' },
        { status: 400 }
      );
    }

    // Walidacja
    if (!name) {
      return NextResponse.json(
        { error: 'Nazwa jest wymagana' },
        { status: 400 }
      );
    }

    // 1) Update bez .returning() (MySQL)
    await db
      .update(exercises)
      .set({
        name,
        instructions,
        enrichment,
        videoUrl,
        crop_id,
      })
      .where(eq(exercises.id, id));

    // 2) Osobny SELECT, by zweryfikować i zwrócić aktualny rekord
    const [exercise] = await db
      .select()
      .from(exercises)
      .where(eq(exercises.id, id));

    if (!exercise) {
      return NextResponse.json(
        { error: 'Ćwiczenie nie zostało znalezione' },
        { status: 404 }
      );
    }

    // Zaktualizuj tagi jeśli zostały podane (może być [] aby wyczyścić)
    if (tag_ids !== undefined) {
      // Usuń istniejące powiązania z tagami
      await db.delete(exercise_tags).where(eq(exercise_tags.exercise_id, id));

      // Dodaj nowe tagi
      if (Array.isArray(tag_ids) && tag_ids.length > 0) {
        for (const tagId of tag_ids) {
          // Sprawdź czy tag istnieje
          const [tag] = await db.select().from(tags).where(eq(tags.id, tagId));
          if (tag) {
            await db.insert(exercise_tags).values({
              exercise_id: id,
              tag_id: tagId,
            });
          }
        }
      }
    }

    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { error: 'Nie udało się zaktualizować ćwiczenia' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Usuń ćwiczenie
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID ćwiczenia' },
        { status: 400 }
      );
    }

    // Sprawdź czy ćwiczenie istnieje
    const [exercise] = await db.select().from(exercises).where(eq(exercises.id, id));

    if (!exercise) {
      return NextResponse.json(
        { error: 'Ćwiczenie nie zostało znalezione' },
        { status: 404 }
      );
    }

    // Znajdź powiązane cropped videos
    const relatedVideos = await db
      .select()
      .from(cropped_videos)
      .where(eq(cropped_videos.crop_id, id));

    for (const video of relatedVideos) {
      // Resetuj status saved w powiązanej adnotacji
      if (video.anno_id) {
        await db
          .update(annotations)
          // UWAGA: jeśli kolumna jest liczbowym TINYINT, ustaw 0 zamiast false
          .set({ saved: 0 })
          .where(eq(annotations.id, video.anno_id));
      }

      // Usuń plik wideo z systemu plików
      if (video.video_url && video.video_url.startsWith('/uploads/')) {
        try {
          const filePath = join(process.cwd(), 'public', video.video_url);
          await unlink(filePath);
          console.log(`Usunięto plik: ${filePath}`);
        } catch (fileError) {
          console.warn(`Nie udało się usunąć pliku: ${video.video_url}`, fileError);
        }
      }

      // Usuń rekord cropped video
      await db.delete(cropped_videos).where(eq(cropped_videos.id, video.id));
    }

    // Usuń powiązania z tagami
    await db.delete(exercise_tags).where(eq(exercise_tags.exercise_id, id));

    // Usuń ćwiczenie
    await db.delete(exercises).where(eq(exercises.id, id));

    return NextResponse.json({
      message: 'Ćwiczenie zostało usunięte wraz z powiązanymi plikami wideo',
    });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { error: 'Nie udało się usunąć ćwiczenia' },
      { status: 500 }
    );
  }
}
