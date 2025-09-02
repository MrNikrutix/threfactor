import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { Exercise } from "@/types/exercise";

interface ExerciseHeaderProps {
  exercise: Exercise;
  showEditButton?: boolean;
}

export function ExerciseHeader({ exercise, showEditButton = false }: ExerciseHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between mb-6">
      <Button 
        variant="ghost" 
        className="flex items-center gap-2" 
        onClick={() => router.push("/")}
      >
        <ArrowLeft className="h-4 w-4" />
        Powrót do listy
      </Button>
      
      {showEditButton && (
        <Button 
          className="flex items-center gap-2" 
          onClick={() => router.push(`/exercises/${exercise.id}/edit`)}
        >
          <Pencil className="h-4 w-4" />
          Edytuj ćwiczenie
        </Button>
      )}
    </div>
  );
}