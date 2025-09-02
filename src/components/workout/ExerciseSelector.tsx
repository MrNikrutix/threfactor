import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Exercise } from '@/types/exercise';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelect: (exerciseId: number) => void;
}

export function ExerciseSelector({ exercises, onSelect }: ExerciseSelectorProps) {
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  const handleSelect = (value: string) => {
    onSelect(parseInt(value));
    setSelectedExercise('');
  };

  return (
    <Select value={selectedExercise} onValueChange={handleSelect}>
      <SelectTrigger className="w-[300px]">
        <Plus className="h-4 w-4 mr-2" />
        <SelectValue placeholder="Dodaj ćwiczenie" />
      </SelectTrigger>
      <SelectContent>
        {exercises.map((exercise) => (
          <SelectItem key={exercise.id} value={exercise.id.toString()}>
            {exercise.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}