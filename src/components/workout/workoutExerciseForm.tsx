import React from 'react';
import {
  ChevronUp,
  ChevronDown,
  Trash2,
  Dumbbell,
  Hash,
  Target,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import  { WorkoutExercise, ExerciseUnit } from '@/types/workout';
import type { Exercise } from '@/types/exercise';

interface WorkoutExerciseFormProps {
  exercise: Omit<WorkoutExercise, 'id'>;
  exerciseIndex: number;
  exercises: Exercise[];
  onUpdate: (exercise: Omit<WorkoutExercise, 'id'>) => void;
  onRemove: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}

export function WorkoutExerciseForm({
  exercise,
  exerciseIndex,
  exercises,
  onUpdate,
  onRemove,
  onMoveUp,
  onMoveDown,
}: WorkoutExerciseFormProps) {
  const exerciseData = exercises.find(ex => ex.id === exercise.exId);
  const exerciseName = exercise.name || exerciseData?.name || `Ćwiczenie ${exerciseIndex + 1}`;

  const updateField = (field: keyof WorkoutExercise, value: any) => {
    const updatedExercise = { ...exercise };
    
    // Handle unit change logic
    if (field === 'unit') {
      if (value === 'CZAS') {
        updatedExercise.quantity = null;
        updatedExercise.duration = updatedExercise.duration ?? 30;
      } else if (value === 'ILOŚĆ') {
        updatedExercise.duration = null;
        updatedExercise.quantity = updatedExercise.quantity ?? 10;
      }
    }
    
    (updatedExercise as any)[field] = value;
    onUpdate(updatedExercise);
  };

  const changeExercise = (exerciseId: string) => {
    const newExerciseData = exercises.find(ex => ex.id === parseInt(exerciseId));
    if (!newExerciseData) return;

    onUpdate({
      ...exercise,
      exId: newExerciseData.id,
      name: newExerciseData.name,
    });
  };

  return (
    <Card className="border border-muted">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Header with exercise name and controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <Dumbbell className="h-4 w-4 text-primary" />
              <Select value={exercise.exId?.toString() || ''} onValueChange={changeExercise}>
                <SelectTrigger className="border-none p-0 h-auto font-medium focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exercises.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id.toString()}>
                      {ex.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-1">
              {onMoveUp && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveUp}
                  className="h-8 w-8 p-0"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
              )}
              
              {onMoveDown && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMoveDown}
                  className="h-8 w-8 p-0"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Exercise Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Sets */}
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <Hash className="h-3 w-3" />
                Serie
              </Label>
              <Input
                type="number"
                min="1"
                value={exercise.sets || 1}
                onChange={(e) => updateField('sets', parseInt(e.target.value) || 1)}
                className="h-8 text-sm"
              />
            </div>

            {/* Unit Selection */}
            <div>
              <Label className="text-xs text-muted-foreground">Typ</Label>
<Select
  value={exercise.unit}
  onValueChange={(value: ExerciseUnit) => updateField('unit', value)}
>
  <SelectTrigger className="h-8 text-sm">
    <SelectValue />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value={ExerciseUnit.QUANTITY}>Ilość</SelectItem>
    <SelectItem value={ExerciseUnit.TIME}>Czas</SelectItem>
  </SelectContent>
</Select>
            </div>

            {/* Quantity or Duration */}
            {exercise.unit === ExerciseUnit.QUANTITY ? (
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  Powtórzenia
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={exercise.quantity ?? 0}
                  onChange={(e) => updateField('quantity', parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
            ) : (
              <div>
                <Label className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Czas (s)
                </Label>
                <Input
                  type="number"
                  min="0"
                  value={exercise.duration ?? 0}
                  onChange={(e) => updateField('duration', parseInt(e.target.value) || 0)}
                  className="h-8 text-sm"
                />
              </div>
            )}

            {/* Rest */}
            <div>
              <Label className="text-xs text-muted-foreground flex items-center gap-1">
                <RotateCcw className="h-3 w-3" />
                Przerwa (s)
              </Label>
              <Input
                type="number"
                min="0"
                value={exercise.rest ?? 0}
                onChange={(e) => updateField('rest', parseInt(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          {/* Exercise Description */}
          {exerciseData?.instructions && (
            <div className="text-xs text-muted-foreground p-2 bg-muted/50 rounded">
              <strong>Instrukcje:</strong> {exerciseData.instructions}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}