import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/DeleteDialog';
import { WorkoutCard } from '@/components/workout/workoutCard';
import { useWorkouts, useWorkoutActions } from '@/hooks/useWorkouts';
import { toast } from 'sonner';
import type { Workout } from '@/types/workout';
import { WorkoutsLoadingSkeleton } from './workoutsLoadingSkeleton';
import { EmptyWorkoutsState } from './emptyWorkoutsState';

export function WorkoutsList() {
  const { workouts, isLoading, isError, error, refreshWorkouts } = useWorkouts();
  const { deleteWorkout } = useWorkoutActions();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workoutToDelete, setWorkoutToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (id: number) => {
    setWorkoutToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!workoutToDelete) return;

    setIsDeleting(true);
    try {
      await deleteWorkout(workoutToDelete);
      toast.success('Trening został usunięty');
      setDeleteDialogOpen(false);
      setWorkoutToDelete(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Błąd podczas usuwania');
    } finally {
      setIsDeleting(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setWorkoutToDelete(null);
  };

  if (isLoading) {
    return <WorkoutsLoadingSkeleton />;
  }

  if (isError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Błąd podczas ładowania treningów: {error?.message}
          </p>
          <Button onClick={refreshWorkouts}>Spróbuj ponownie</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4"
        >
          <Link href="/workouts/new">
            <Button>
              <Plus className="mr-2 h-5 w-5" />
              Stwórz Nowy Trening
            </Button>
          </Link>
        </motion.div>

        <AnimatePresence>
          {workouts.length === 0 ? (
            <EmptyWorkoutsState />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            >
              {workouts.map((workout, index) => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  onDelete={handleDeleteClick}
                  index={index}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <DeleteDialog
        open={deleteDialogOpen}
        onOpenChange={closeDeleteDialog}
        onConfirm={handleDeleteConfirm}
        loading={isDeleting}
      />
    </>
  );
}