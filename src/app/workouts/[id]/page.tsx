"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WorkoutDetailsSkeleton } from "@/components/workout/WorkoutDetailsSkeleton";
import { WorkoutDetailsError } from "@/components/workout/WorkoutDetailsError";
import { WorkoutTimer } from "@/components/workout/workoutTimer";
import { useWorkout } from "@/hooks/useWorkouts";

export default function WorkoutPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const { workout, isLoading, isError, error, refreshWorkout } = useWorkout(id);

  const handleGoBack = () => {
    router.push("/workouts");
  };

  const handleEdit = () => {
    router.push(`/workouts/${id}/edit`);
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
          <Button onClick={handleGoBack} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do listy treningów
          </Button>
        </div>
      </ContentLayout>
    );
  }

  return (
    <WorkoutTimer 
      workout={workout} 
      onGoBack={handleGoBack}
      onEdit={handleEdit}
    />
  );
}