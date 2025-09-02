import { ExerciseItem } from './ExerciseItem';
import type { Exercise } from '@/types/exercise';

interface ExercisesTableProps {
  exercises: Exercise[];
  onDelete: (exerciseId: number, exerciseName: string) => void;
  isDeleting: boolean;
}

export const ExercisesTable = ({ exercises, onDelete, isDeleting }: ExercisesTableProps) => {
  return (
    <div className="hidden md:block">
      {/* Table Header */}
      <div className="rounded-t-lg bg-black text-white">
        <div className="grid grid-cols-12 gap-4 px-8 py-6 text-sm font-semibold tracking-wider uppercase">
          <div className="col-span-3">Nazwa ćwiczenia</div>
          <div className="col-span-6">Tagi</div>
          <div className="col-span-3 text-center">Akcje</div>
        </div>
      </div>

      {/* Table Body */}
      <div className="mt-4 space-y-4">
        {exercises.map((exercise) => (
          <ExerciseItem
            key={exercise.id}
            exercise={exercise}
            onDelete={onDelete}
            isDeleting={isDeleting}
          />
        ))}
      </div>
    </div>
  );
};