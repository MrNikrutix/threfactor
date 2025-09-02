"use client";

import { ContentLayout } from "@/components/admin-panel/content-layout";
import { WorkoutsList } from "@/components/workout/workoutList";

export default function WorkoutsPage() {
  return (
    <ContentLayout title="Lista konspektów">
      <WorkoutsList />
    </ContentLayout>
  );
}
