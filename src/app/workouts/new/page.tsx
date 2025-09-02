"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WorkoutForm } from "@/components/workout/workoutForm";
import { useWorkoutActions } from "@/hooks/useWorkouts";
import { toast } from "sonner";
import type { WorkoutFormData } from "@/types/workout";

export default function NewWorkoutPage() {
  const router = useRouter();
  const { createWorkout } = useWorkoutActions();
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (data: WorkoutFormData) => {
    setIsLoading(true);
    try {
      await createWorkout(data);
      toast.success("Trening został utworzony");
      router.push("/workouts");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Błąd podczas tworzenia treningu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/workouts");
  };

  return (
    <ContentLayout title="Tworzenie nowego konspektu">
      <div className="container mx-auto px-4 py-8">
        <WorkoutForm
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </ContentLayout>
  );
}