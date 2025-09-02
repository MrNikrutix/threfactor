import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Dumbbell } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function EmptyWorkoutsState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <div className="rounded-full bg-muted p-6 mb-4">
        <Dumbbell className="h-12 w-12 text-muted-foreground" />
      </div>
      <h3 className="text-xl font-medium mb-2">
        Nie znaleziono żadnych treningów
      </h3>
      <p className="text-muted-foreground mb-6">
        Stwórz swój pierwszy trening, aby rozpocząć śledzenie swoich postępów!
      </p>
      <Link href="/workouts/new">
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Stwórz Nowy Trening
        </Button>
      </Link>
    </motion.div>
  );
}