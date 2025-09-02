import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Pencil, Trash2, LoaderCircle } from "lucide-react";

interface Tag {
  id: number;
  name: string;
}

interface Exercise {
  id: number;
  name: string;
  instructions: string;
  enrichment: string;
  videoUrl: string | null;
  crop_id: number | null;
  tags: Tag[];
}

interface ExerciseItemProps {
  exercise: Exercise;
  onDelete: (exerciseId: number, exerciseName: string) => void;
  isDeleting: boolean;
}

export const ExerciseItem = ({ exercise, onDelete, isDeleting }: ExerciseItemProps) => {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        <div className="grid grid-cols-12 items-center gap-4 px-8 py-6">
          <div className="col-span-3">
            <span className="font-medium">{exercise.name}</span>
          </div>
          <div className="col-span-6">
            <div className="flex flex-wrap gap-2">
              {exercise.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant="secondary"
                  className="rounded-full bg-gray-800 px-4 py-1 text-xs font-bold text-white hover:bg-gray-700"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
          <div className="col-span-3 flex justify-center gap-4">
            <Button variant="ghost" size="sm">
              <a href={`/exercises/${exercise.id}`}>
                <Search className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm">
              <a href={`/exercises/${exercise.id}/edit`}>
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