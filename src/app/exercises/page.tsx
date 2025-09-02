'use client';

import { useState } from 'react';
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { AddExerciseButton } from '@/components/exercises/AddExerciseButton';
import { ExercisesTable } from '@/components/exercises/ExercisesTable';
import { MobileExercisesList } from '@/components/exercises/MobileExercisesList';
import { LoadingState } from '@/components/LoadingState';
import { EmptyState } from '@/components/exercises/EmptyState';
import { ErrorState } from '@/components/exercises/ErrorState';
import { useExercises } from '@/hooks/useExercises';

export default function Home() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { exercises, isLoading, isError, error, deleteExercise, refreshExercises } = useExercises();

  const handleDelete = async (exerciseId: number, exerciseName: string) => {
    setIsDeleting(true);
    try {
      await deleteExercise(exerciseId, exerciseName);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <ContentLayout title="Lista Ćwiczeń">
        <LoadingState />
      </ContentLayout>
    );
  }

  if (isError) {
    return (
      <ContentLayout title="Lista Ćwiczeń">
        <ErrorState error={error} onRetry={refreshExercises} />
      </ContentLayout>
    );
  }

  return (
    <ContentLayout title="Lista Ćwiczeń">
      <main className="bg-gray-50">
        <div className="container mx-auto">
          <div className="mx-auto w-full max-w-6xl p-6">
            <AddExerciseButton />
            
            <hr className="mb-6 border-gray-200" />

            <ExercisesTable 
              exercises={exercises} 
              onDelete={handleDelete} 
              isDeleting={isDeleting} 
            />

            <MobileExercisesList 
              exercises={exercises} 
              onDelete={handleDelete} 
              isDeleting={isDeleting} 
            />

            {exercises.length === 0 && <EmptyState />}
          </div>
        </div>
      </main>
    </ContentLayout>
  );
}