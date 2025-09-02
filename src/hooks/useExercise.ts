import useSWR from 'swr';
import { Exercise } from '@/types/exercise';
import { getExerciseById } from '@/lib/api-client';

export function useExercise(id: string) {
  const { data, error, isLoading, mutate } = useSWR<Exercise>(
    id ? `/api/exercises/${id}` : null,
    () => getExerciseById(id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    exercise: data,
    isLoading,
    error,
    mutate,
  };
}