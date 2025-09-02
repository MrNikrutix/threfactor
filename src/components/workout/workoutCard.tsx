import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Dumbbell, Calendar, Clock, Edit, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { Workout } from '@/types/workout';

interface WorkoutCardProps {
  workout: Workout;
  onDelete: (id: number) => void;
  index: number;
}

export function WorkoutCard({ workout, onDelete, index }: WorkoutCardProps) {
  const totalExercises = workout.sections.reduce((acc, section) => acc + section.exercises.length, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, transition: { delay: index * 0.1 } }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-xl font-bold mb-1 line-clamp-1">
                {workout.title}
              </CardTitle>
              {workout.description && (
                <CardDescription className="line-clamp-2">
                  {workout.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="py-2 flex-grow">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="mr-1 h-4 w-4" />
              <span>{workout.duration || 0} min</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground">
              <Dumbbell className="mr-1 h-4 w-4" />
              <span>{totalExercises} ćwiczeń</span>
            </div>
            <div className="flex items-center text-sm text-muted-foreground col-span-2">
              <Calendar className="mr-1 h-4 w-4" />
              <span>
                {new Date(workout.created_at ?? workout.createdAt ?? "").toLocaleDateString("pl-PL")}
              </span>
            </div>
          </div>

          {/* Podgląd sekcji */}
          <div className="space-y-1 mb-4">
            {workout.sections.slice(0, 2).map((section, index) => (
              <div key={section.id || index} className="text-xs text-muted-foreground">
                • {section.name} ({section.exercises.length} ćwiczeń)
              </div>
            ))}
            {workout.sections.length > 2 && (
              <div className="text-xs text-muted-foreground">
                + {workout.sections.length - 2} więcej sekcji
              </div>
            )}
          </div>
        </CardContent>

        <div className="p-4 pt-0 mt-auto border-t bg-muted/10">
          <div className="flex justify-between gap-2">
            <Link href={`/workouts/${workout.id}`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Dumbbell className="h-4 w-4 mr-2" />
                Otwórz
              </Button>
            </Link>
            <Link href={`/workouts/${workout.id}/edit`} className="flex-1">
              <Button variant="outline" className="w-full">
                <Edit className="h-4 w-4 mr-2" />
                Edytuj
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => onDelete(workout.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Usuń</span>
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}