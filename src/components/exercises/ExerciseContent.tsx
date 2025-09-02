import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Exercise } from "@/types/exercise";

interface ExerciseContentProps {
  exercise: Exercise;
}

export function ExerciseContent({ exercise }: ExerciseContentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">{exercise.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          {exercise.tags?.map((tag) => (
            <Badge key={tag.id} variant="secondary">
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {exercise.instructions && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Instrukcje</h3>
            <div className="prose max-w-none whitespace-pre-wrap">
              {exercise.instructions}
            </div>
          </div>
        )}

        {exercise.enrichment && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Dodatkowe informacje</h3>
            <div className="prose max-w-none whitespace-pre-wrap">
              {exercise.enrichment}
            </div>
          </div>
        )}

        {exercise.videoUrl && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Wideo instruktażowe</h3>
            <div className="aspect-video rounded-md overflow-hidden bg-muted">
              <iframe
                src={exercise.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title={`Wideo instruktażowe dla ${exercise.name}`}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}