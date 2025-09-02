import useSWR, { mutate } from 'swr';
import type { Workout, WorkoutFormData } from '@/types/workout';

const API_BASE = '/api/workouts';

// Fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = new Error('Błąd podczas pobierania danych');
    (error as any).info = await response.json();
    (error as any).status = response.status;
    throw error;
  }
  return response.json();
};

// Hook do pobierania wszystkich treningów
export const useWorkouts = () => {
  const { data, error, isLoading, mutate: mutateSWR } = useSWR<Workout[]>(
    API_BASE,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  const refreshWorkouts = () => mutateSWR();

  return {
    workouts: data || [],
    isLoading,
    isError: !!error,
    error,
    refreshWorkouts,
  };
};

// Hook do pobierania pojedynczego treningu
export const useWorkout = (id: string | number) => {
  const shouldFetch = id && id !== 'undefined' && id !== '';
  
  const { data, error, isLoading, mutate: mutateSWR } = useSWR<Workout>(
    shouldFetch ? `${API_BASE}/${id}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const refreshWorkout = () => mutateSWR();

  return {
    workout: data,
    isLoading,
    isError: !!error,
    error,
    refreshWorkout,
  };
};

// Hook do akcji na treningach
export const useWorkoutActions = () => {
  // Tworzenie treningu
  const createWorkout = async (workoutData: WorkoutFormData): Promise<Workout> => {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Nie udało się utworzyć treningu');
    }

    const newWorkout = await response.json();
    
    // Invalidate cache
    mutate(API_BASE);
    
    return newWorkout;
  };

  // Aktualizacja treningu
  const updateWorkout = async (id: string | number, workoutData: WorkoutFormData): Promise<Workout> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(workoutData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Nie udało się zaktualizować treningu');
    }

    const updatedWorkout = await response.json();
    
    // Invalidate cache
    mutate(API_BASE);
    mutate(`${API_BASE}/${id}`);
    
    return updatedWorkout;
  };

  // Usuwanie treningu
  const deleteWorkout = async (id: number): Promise<void> => {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Nie udało się usunąć treningu');
    }

    // Invalidate cache
    mutate(API_BASE);
  };

  return {
    createWorkout,
    updateWorkout,
    deleteWorkout,
  };
};

// Helper do invalidacji cache
export const invalidateWorkoutsCache = () => {
  mutate(API_BASE);
};

export const invalidateWorkoutCache = (id: string | number) => {
  mutate(`${API_BASE}/${id}`);
};