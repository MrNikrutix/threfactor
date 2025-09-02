"use client";

import { use } from "react";
import { useExercise } from "@/hooks/useExercise";
import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { updateExercise } from "@/lib/api-client";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/exercises/ErrorState";
import { ContentLayout } from "@/components/admin-panel/content-layout";

interface EditExerciseProps {
  params: Promise<{ id: string }>;
}

export default function EditExercise({ params }: EditExerciseProps) {
  const { id } = use(params);
  const { exercise, isLoading, error, mutate } = useExercise(id);

  const handleSubmit = async (formData: any) => {
    const result = await updateExercise(id, formData);
    // Refresh the exercise data
    mutate();
    return result;
  };

  if (error) {
    return (
      <ContentLayout title="Błąd">
        <ErrorState error={error} onRetry={mutate} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Edycja ćwiczenia: ${exercise?.name || id}`}>
      <ExerciseForm
        initialData={exercise}
        submitLabel="Zapisz zmiany"
        onSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </ContentLayout>
  );
}