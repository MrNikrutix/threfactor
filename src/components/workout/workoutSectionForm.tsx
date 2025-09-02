import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight,
  Plus, 
  Trash2, 
  MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { WorkoutExerciseForm } from '@/components/workout/workoutExerciseForm';
import type { WorkoutSection, WorkoutExercise } from '@/types/workout';
import { ExerciseUnit} from '@/types/workout';
import type { Exercise } from '@/types/exercise';
import { ExerciseSelector } from './ExerciseSelector';

interface WorkoutSectionFormProps {
  section: Omit<WorkoutSection, 'id' | 'workId'>;
  sectionIndex: number;
  exercises: Exercise[];
  onUpdate: (section: Omit<WorkoutSection, 'id' | 'workId'>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WorkoutSectionForm({
  section,
  sectionIndex,
  exercises,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutSectionFormProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const addExercise = (exerciseId: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const newWorkoutExercise: Omit<WorkoutExercise, 'id'> = {
      exId: exercise.id,
      name: exercise.name,
      sets: 3,
      quantity: 10,
      unit: ExerciseUnit.QUANTITY,
      duration: null,
      rest: 60,
      position: section.exercises.length,
    };

    onUpdate({
      ...section,
      exercises: [...section.exercises, newWorkoutExercise],
    });
  };

  const updateExercise = (exerciseIndex: number, exercise: Omit<WorkoutExercise, 'id'>) => {
    const updatedExercises = [...section.exercises];
    updatedExercises[exerciseIndex] = exercise;
    onUpdate({ ...section, exercises: updatedExercises });
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = section.exercises
      .filter((_, i) => i !== exerciseIndex)
      .map((ex, i) => ({ ...ex, position: i }));
    
    onUpdate({ ...section, exercises: updatedExercises });
  };

  const moveExercise = (fromIndex: number, toIndex: number) => {
    const updatedExercises = [...section.exercises];
    const [movedExercise] = updatedExercises.splice(fromIndex, 1);
    updatedExercises.splice(toIndex, 0, movedExercise);
    
    // Update positions
    updatedExercises.forEach((exercise, index) => {
      exercise.position = index;
    });

    onUpdate({ ...section, exercises: updatedExercises });
  };

  return (
    <Card className="border-l-4 border-l-primary">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              value={section.name}
              onChange={(e) => onUpdate({ ...section, name: e.target.value })}
              placeholder="Nazwa sekcji"
              className="font-semibold text-base border-none p-0 h-auto focus-visible:ring-0"
            />
          </div>
          
          <Badge variant="secondary" className="text-xs">
            {section.exercises.length} ćwiczeń
          </Badge>

          <div className="flex items-center gap-1">
            {onMoveUp && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveUp}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            {onMoveDown && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMoveDown}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRemove} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Usuń sekcję
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-3">
            {section.exercises.map((exercise, exerciseIndex) => (
              <WorkoutExerciseForm
                key={exerciseIndex}
                exercise={exercise}
                exerciseIndex={exerciseIndex}
                exercises={exercises}
                onUpdate={(updatedExercise) => updateExercise(exerciseIndex, updatedExercise)}
                onRemove={() => removeExercise(exerciseIndex)}
                onMoveUp={exerciseIndex > 0 ? () => moveExercise(exerciseIndex, exerciseIndex - 1) : undefined}
                onMoveDown={exerciseIndex < section.exercises.length - 1 ? () => moveExercise(exerciseIndex, exerciseIndex + 1) : undefined}
              />
            ))}
            
            {section.exercises.length === 0 && (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Brak ćwiczeń w tej sekcji. Dodaj pierwsze ćwiczenie.
                </p>
              </div>
            )}
          </div>

          {/* Add Exercise Section */}
          <div className="mt-4 pt-4 border-t">
            <ExerciseSelector exercises={exercises} onSelect={addExercise} />
          </div>
        </CardContent>
      )}
    </Card>
  );
}