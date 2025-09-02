import { Exercise, ExerciseFormData, Tag } from '@/types/exercise';
import { Workout, WorkoutFormData } from '@/types/workout';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getExerciseById(id: string): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises/${id}`);
  
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Ćwiczenie nie zostało znalezione');
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Nie udało się pobrać ćwiczenia');
  }
  
  return response.json();
}

export async function updateExercise(id: string, data: ExerciseFormData): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Nie udało się zaktualizować ćwiczenia');
  }

  return response.json();
}

export async function createExercise(data: ExerciseFormData): Promise<Exercise> {
  const response = await fetch(`${API_BASE_URL}/api/exercises`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Nie udało się utworzyć ćwiczenia');
  }

  return response.json();
}

export async function getAllTags(): Promise<Tag[]> {
  const response = await fetch(`${API_BASE_URL}/api/tags`);
  
  if (!response.ok) {
    throw new Error('Nie udało się pobrać tagów');
  }
  
  return response.json();
}

export async function createTag(name: string): Promise<Tag> {
  const response = await fetch(`${API_BASE_URL}/api/tags`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name: name.trim() }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || 'Nie udało się utworzyć tagu');
  }

  return response.json();
}
