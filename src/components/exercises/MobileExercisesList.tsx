import { MobileExerciseItem } from './MobileExerciseItem';
import type { Exercise } from '@/types/exercise';

interface MobileExercisesListProps {
  exercises: Exercise[];
  onDelete: (exerciseId: number, exerciseName: string) => void;
  isDeleting: boolean;
}

export const MobileExercisesList = ({ exercises, onDelete, isDeleting }: MobileExercisesListProps) => {
  return (
    <div className="space-y-4 md:hidden">
      {exercises.map((exercise) => (
        <MobileExerciseItem
          key={exercise.id}
          exercise={exercise}
          onDelete={onDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};