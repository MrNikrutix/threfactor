import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts, workout_sections, workout_exercises } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { ExerciseUnit } from '@/db/schema/workout';

async function getFullWorkout(workoutId: number) {
  const [workout] = await db.select().from(workouts).where(eq(workouts.id, workoutId));
  
  if (!workout) return null;

  const sections = await db
    .select()
    .from(workout_sections)
    .where(eq(workout_sections.work_id, workoutId))
    .orderBy(workout_sections.position);

  const sectionsWithExercises = await Promise.all(
    sections.map(async (section) => {
      const exercises = await db
        .select()
        .from(workout_exercises)
        .where(eq(workout_exercises.section_id, section.id))
        .orderBy(workout_exercises.position);

      return {
        ...section,
        exercises,
      };
    })
  );

  return {
    ...workout,
    sections: sectionsWithExercises,
  };
}

// GET /api/workouts/[id] - Pobierz trening po ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID treningu' },
        { status: 400 }
      );
    }

    const fullWorkout = await getFullWorkout(id);

    if (!fullWorkout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(fullWorkout);
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}

// PUT /api/workouts/[id] - Zaktualizuj trening
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { title, description, duration, sections } = body;

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID treningu' },
        { status: 400 }
      );
    }

    // Walidacja
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    // Sprawdź czy trening istnieje
    const [existingWorkout] = await db.select().from(workouts).where(eq(workouts.id, id));
    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Zaktualizuj podstawowe informacje treningu
    await db
      .update(workouts)
      .set({
        title,
        description,
        duration,
      })
      .where(eq(workouts.id, id));

    // Pobierz wszystkie istniejące sekcje
    const existingSections = await db
      .select()
      .from(workout_sections)
      .where(eq(workout_sections.work_id, id));

    // Usuń wszystkie istniejące ćwiczenia z sekcji
    if (existingSections.length > 0) {
      const sectionIds = existingSections.map(s => s.id);
      await db.delete(workout_exercises).where(inArray(workout_exercises.section_id, sectionIds));
    }

    // Usuń wszystkie istniejące sekcje
    await db.delete(workout_sections).where(eq(workout_sections.work_id, id));

    // Utwórz nowe sekcje z ćwiczeniami
    if (sections && Array.isArray(sections)) {
      for (const sectionData of sections) {
        const [section] = await db.insert(workout_sections).values({
          work_id: id,
          name: sectionData.name,
          position: sectionData.position,
        }).returning();

        // Dodaj ćwiczenia do sekcji
        if (sectionData.exercises && Array.isArray(sectionData.exercises)) {
          for (const exerciseData of sectionData.exercises) {
            await db.insert(workout_exercises).values({
              section_id: section.id,
              ex_id: exerciseData.ex_id,
              sets: exerciseData.sets,
              quantity: exerciseData.quantity,
              unit: exerciseData.unit as ExerciseUnit,
              duration: exerciseData.duration,
              rest: exerciseData.rest,
              position: exerciseData.position,
            });
          }
        }
      }
    }

    // Pobierz zaktualizowany trening
    const fullWorkout = await getFullWorkout(id);

    return NextResponse.json(fullWorkout);
  } catch (error) {
    console.error('Error updating workout:', error);
    return NextResponse.json(
      { error: 'Failed to update workout' },
      { status: 500 }
    );
  }
}

// DELETE /api/workouts/[id] - Usuń trening
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Nieprawidłowe ID treningu' },
        { status: 400 }
      );
    }

    // Sprawdź czy trening istnieje
    const [existingWorkout] = await db.select().from(workouts).where(eq(workouts.id, id));
    if (!existingWorkout) {
      return NextResponse.json(
        { error: 'Workout not found' },
        { status: 404 }
      );
    }

    // Pobierz wszystkie sekcje tego treningu
    const sections = await db
      .select()
      .from(workout_sections)
      .where(eq(workout_sections.work_id, id));

    // Usuń wszystkie ćwiczenia z sekcji
    if (sections.length > 0) {
      const sectionIds = sections.map(s => s.id);
      await db.delete(workout_exercises).where(inArray(workout_exercises.section_id, sectionIds));
    }

    // Usuń wszystkie sekcje
    await db.delete(workout_sections).where(eq(workout_sections.work_id, id));

    // Usuń trening
    await db.delete(workouts).where(eq(workouts.id, id));

    return NextResponse.json({ message: 'Workout deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout:', error);
    return NextResponse.json(
      { error: 'Failed to delete workout' },
      { status: 500 }
    );
  }
}