import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Pencil, Trash2, LoaderCircle } from "lucide-react";
import type { Exercise } from "@/types/exercise";

interface MobileExerciseItemProps {
  exercise: Exercise;
  onDelete: (exerciseId: number, exerciseName: string) => void;
  isDeleting: boolean;
}

export const MobileExerciseItem = ({ exercise, onDelete, isDeleting }: MobileExerciseItemProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-gray-600">Nazwa ćwiczenia:</span>
          <span className="ml-4 flex-1 text-right font-medium">{exercise.name}</span>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-sm font-medium text-gray-600">Tagi:</span>
          <div className="ml-4 flex flex-1 flex-wrap justify-end gap-2">
            {exercise.tags.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="rounded-full bg-gray-800 px-3 py-1 text-xs font-bold text-white hover:bg-gray-700"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-medium text-gray-600">Akcje:</span>
          <div className="flex gap-3">
            <Button variant="ghost" size="sm">
              <a href={`/${exercise.id}`}>
                <Search className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <a href={`/${exercise.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </a>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(exercise.id, exercise.name)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};