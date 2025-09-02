"use client";

import { ExerciseForm } from "@/components/exercises/ExerciseForm";
import { createExercise } from "@/lib/api-client";
import { ContentLayout } from "@/components/admin-panel/content-layout";

export default function NewExercisePage() {
  return (
    <ContentLayout title="Tworzenie nowego ćwiczenia">
      <ExerciseForm
        submitLabel="Zapisz ćwiczenie"
        onSubmit={createExercise}
      />
    </ContentLayout>
  );
}