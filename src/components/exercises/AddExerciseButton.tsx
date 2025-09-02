import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const AddExerciseButton = () => {
  return (
    <div className="mb-6">
      <Button className="bg-gray-800 px-6 py-3 text-white hover:bg-gray-700">
        <a href="/exercises/new" className="flex items-center gap-2 text-white no-underline">
          <Plus className="h-4 w-4" />
          Dodaj nowe ćwiczenie
        </a>
      </Button>
    </div>
  );
};