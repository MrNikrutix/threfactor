import type { Workout, WorkoutActivity } from '@/types/workout';
import { ExerciseUnit } from '@/types/workout';

export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

export function flattenWorkoutActivities(workout: Workout): WorkoutActivity[] {
  const activities: WorkoutActivity[] = [];

  workout.sections.forEach((section) => {
    section.exercises.forEach((exercise) => {
      for (let set = 1; set <= exercise.sets; set++) {
        // Właściwe ćwiczenie
        activities.push({
          id: `${exercise.id || exercise.exId}-${set}`,
          name: exercise.name || `Ćwiczenie ${exercise.exId}`,
          type: 'exercise',
          unit: exercise.unit,
          duration: exercise.unit === ExerciseUnit.TIME ? exercise.duration ?? 0 : 0,
          quantity: exercise.unit === ExerciseUnit.QUANTITY ? exercise.quantity ?? 0 : undefined,
          sectionName: section.name,
          currentSet: set,
          totalSets: exercise.sets,
        });

        // Dodaj przerwę po każdym secie (poza ostatnim w ostatnim ćwiczeniu)
        const isLastSetOfLastExercise =
          section === workout.sections[workout.sections.length - 1] &&
          exercise === section.exercises[section.exercises.length - 1] &&
          set === exercise.sets;

        if (exercise.rest && exercise.rest > 0 && !isLastSetOfLastExercise) {
          activities.push({
            id: `rest-${exercise.id || exercise.exId}-${set}`,
            name: 'Przerwa',
            type: 'rest',
            unit: ExerciseUnit.TIME,
            duration: exercise.rest,
            sectionName: section.name,
            currentSet: set,
            totalSets: exercise.sets,
          });
        }
      }
    });
  });

  return activities;
}
