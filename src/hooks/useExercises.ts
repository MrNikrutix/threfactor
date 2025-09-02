import useSWR, { mutate } from 'swr';
import { Exercise } from '@/types/exercise';

const fetcher = async (url: string): Promise<Exercise[]> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Błąd podczas pobierania ćwiczeń');
  }
  return response.json();
};

export const useExercises = () => {
  const { data, error, isLoading, mutate: mutateSWR } = useSWR<Exercise[]>(
    '/api/exercises',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const deleteExercise = async (exerciseId: number, exerciseName: string) => {
    if (!confirm(`Czy na pewno chcesz usunąć to ćwiczenie "${exerciseName}"?`)) {
      return false;
    }

    try {
      // Optimistic update - usuń z lokalnego state natychmiast
      const optimisticData = data?.filter(ex => ex.id !== exerciseId) || [];
      await mutateSWR(
        async () => {
          const response = await fetch(`/api/exercises/${exerciseId}`, {
            method: 'DELETE',
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Nie udało się usunąć ćwiczenia');
          }

          return optimisticData;
        },
        {
          optimisticData,
          rollbackOnError: true,
          populateCache: true,
          revalidate: false,
        }
      );

      return true;
    } catch (error) {
      console.error('Błąd:', error);
      alert(error instanceof Error ? error.message : 'Wystąpił błąd podczas usuwania ćwiczenia');
      return false;
    }
  };

  const refreshExercises = () => {
    mutateSWR();
  };

  // Globalna funkcja do aktualizacji cache po dodaniu nowego ćwiczenia
  const addExerciseToCache = (newExercise: Exercise) => {
    mutateSWR([...(data || []), newExercise], false);
  };

  return {
    exercises: data || [],
    isLoading,
    isError: !!error,
    error,
    deleteExercise,
    refreshExercises,
    addExerciseToCache,
  };
};

// Dodatkowa funkcja do invalidacji cache z innych komponentów
export const invalidateExercisesCache = () => {
  mutate('/api/exercises');
};