import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle } from "lucide-react";

interface ErrorStateProps {
  error: Error | null;
  onRetry: () => void;
}

export const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="py-12 text-center">
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-gray-900">
            Wystąpił błąd podczas ładowania ćwiczeń
          </h3>
          <p className="text-sm text-gray-500">
            {error?.message || 'Nieznany błąd'}
          </p>
        </div>
        <Button 
          onClick={onRetry}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          Spróbuj ponownie
        </Button>
      </div>
    </div>
  );
};