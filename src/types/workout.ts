export enum ExerciseUnit {
  QUANTITY = 'ILOŚć',
  TIME = 'CZAS'
}

export interface WorkoutExercise {
  id?: number;
  exId: number;
  name: string;
  sets: number;
  quantity: number | null;
  unit: ExerciseUnit;
  duration: number | null;
  rest: number;
  position: number;
}

export interface WorkoutSection {
  id?: number;
  work_id?: number;
  name: string;
  position: number;
  exercises: WorkoutExercise[];
}

export interface Workout {
  id: number;
  title: string;
  description: string | null;
  duration: number | null;
  created_at?: string;
  createdAt?: string;
  sections: WorkoutSection[];
}

export interface WorkoutFormData {
  title: string;
  description: string | null;
  duration: number | null;
  sections: Omit<WorkoutSection, 'id' | 'work_id'>[];
}

// Typ dla spłaszczonej aktywności w timerze
export interface WorkoutActivity {
  id: string;
  name: string;
  type: 'exercise' | 'rest';
  duration: number;
  quantity?: number;
  unit: ExerciseUnit;
  sectionName: string;
  currentSet: number;
  totalSets: number;
}