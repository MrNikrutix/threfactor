"use client";

import { use } from "react";
import { useExercise } from "@/hooks/useExercise";
import { ExerciseHeader } from "@/components/exercises/ExerciseHeader";
import { ExerciseContent } from "@/components/exercises/ExerciseContent";
import { LoadingState } from "@/components/LoadingState";
import { ErrorState } from "@/components/exercises/ErrorState";
import { ContentLayout } from "@/components/admin-panel/content-layout";

interface ExerciseDetailsProps {
  params: Promise<{ id: string }>;
}

export default function ExerciseDetails({ params }: ExerciseDetailsProps) {
  const { id } = use(params);
  const { exercise, isLoading, error, mutate } = useExercise(id);

  if (isLoading) {
    return (
      <ContentLayout title="Ładowanie...">
        <LoadingState />
      </ContentLayout>
    );
  }

  if (error || !exercise) {
    return (
      <ContentLayout title="Błąd">
        <ErrorState 
          error={error || new Error("Ćwiczenie nie zostało znalezione")} 
          onRetry={mutate} 
        />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Podgląd ćwiczenia: ${exercise.name}`}>
      <div className="container mx-auto py-10">
        <ExerciseHeader exercise={exercise} showEditButton />
        <ExerciseContent exercise={exercise} />
      </div>
    </ContentLayout>
  );
}