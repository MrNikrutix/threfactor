import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workouts, workout_sections, workout_exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { ExerciseUnit } from '@/db/schema/workout';

// GET /api/workouts - Pobierz wszystkie treningi
export async function GET() {
  try {
    const result = await db.select().from(workouts);
    
    // Pobierz sekcje i ćwiczenia dla każdego treningu
    const workoutsWithSections = await Promise.all(
      result.map(async (workout) => {
        const sections = await db
          .select()
          .from(workout_sections)
          .where(eq(workout_sections.work_id, workout.id))
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
      })
    );

    return NextResponse.json(workoutsWithSections);
  } catch (error) {
    console.error('Error fetching workouts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch workouts' },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Utwórz nowy trening
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, duration, sections } = body;

    // Walidacja
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required and must be a string' },
        { status: 400 }
      );
    }

    if (!sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Sections must be provided' },
        { status: 400 }
      );
    }

    // Utwórz trening
    const [workout] = await db.insert(workouts).values({
      title,
      description,
      duration
    }).returning();

    // Utwórz sekcje z ćwiczeniami
    for (const sectionData of sections) {
      const [section] = await db.insert(workout_sections).values({
        work_id: workout.id,
        name: sectionData.name,
        position: sectionData.position,
      }).returning();

      // Dodaj ćwiczenia do sekcji
      if (sectionData.exercises && Array.isArray(sectionData.exercises)) {
        for (const exerciseData of sectionData.exercises) {
          // POPRAWKA: Walidacja ex_id i użycie poprawnej nazwy pola
          const exId = exerciseData.exId || exerciseData.ex_id;
          
          if (!exId) {
            console.error('Missing ex_id for exercise:', exerciseData);
            continue; // Pomiń ćwiczenie bez ID
          }

          await db.insert(workout_exercises).values({
            section_id: section.id,
            ex_id: exId, // POPRAWKA: użyj exId zamiast exerciseData.ex_id
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

    // Pobierz kompletny trening z sekcjami i ćwiczeniami
    const fullWorkout = await getFullWorkout(workout.id);

    return NextResponse.json(fullWorkout, { status: 201 });
  } catch (error) {
    console.error('Error creating workout:', error);
    return NextResponse.json(
      { error: 'Failed to create workout' },
      { status: 500 }
    );
  }
}

// Funkcja pomocnicza do pobierania pełnego treningu
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