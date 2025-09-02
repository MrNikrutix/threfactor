import { Button } from "@/components/ui/button";

interface WorkoutDetailsErrorProps {
  error: any;
  onRetry: () => void;
}

export function WorkoutDetailsError({ error, onRetry }: WorkoutDetailsErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <p className="text-red-500 mb-4">
        Błąd podczas ładowania treningu: {error?.message}
      </p>
      <Button onClick={onRetry}>Spróbuj ponownie</Button>
    </div>
  );
}