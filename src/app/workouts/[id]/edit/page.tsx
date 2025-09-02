"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WorkoutForm } from "@/components/workout/workoutForm";
import { WorkoutDetailsSkeleton } from "@/components/workout/WorkoutDetailsSkeleton";
import { WorkoutDetailsError } from "@/components/workout/WorkoutDetailsError";
import { useWorkout, useWorkoutActions } from "@/hooks/useWorkouts";
import { toast } from "sonner";
import type { WorkoutFormData } from "@/types/workout";

interface EditWorkoutPageProps {
  params: Promise<{ id: string }>; // POPRAWKA: params jako Promise
}

export default function EditWorkoutPage({ params }: EditWorkoutPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { workout, isLoading, isError, error, refreshWorkout } = useWorkout(id);
  const { updateWorkout } = useWorkoutActions();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (data: WorkoutFormData) => {
    setIsSaving(true);
    try {
      await updateWorkout(id, data);
      toast.success("Trening został zaktualizowany");
      router.push(`/workouts/${id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd podczas aktualizacji treningu");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/workouts/${id}`);
  };

  if (isLoading) {
    return (
      <ContentLayout title="Ładowanie...">
        <WorkoutDetailsSkeleton />
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Błąd">
        <WorkoutDetailsError error={error} onRetry={refreshWorkout} />
      </ContentLayout>
    );
  }

  if (!workout) {
    return (
      <ContentLayout title="Nie znaleziono">
        <div className="container mx-auto py-10">
          <p>Trening nie został znaleziony</p>
        </div>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title={`Edycja treningu: ${workout.title}`}>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Edytuj trening</h1>
        <WorkoutForm
          initialWorkout={workout}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isSaving}
          isEditMode={true}
        />
      </div>
    </ContentLayout>
  );
}