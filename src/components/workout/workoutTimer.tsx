import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Check,
  Edit,
  ArrowLeft,
} from "lucide-react";
import { Noto_Sans } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { flattenWorkoutActivities, formatTime } from "@/lib/workoutUtils";
import  { Workout, WorkoutActivity, ExerciseUnit} from "@/types/workout";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface WorkoutTimerProps {
  workout: Workout;
  onGoBack: () => void;
  onEdit: () => void;
}

export function WorkoutTimer({ workout, onGoBack, onEdit }: WorkoutTimerProps) {
  const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
  const [activityTimeRemaining, setActivityTimeRemaining] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(false);
  const [allActivities, setAllActivities] = useState<WorkoutActivity[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<string>("default");

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize workout activities
  useEffect(() => {
    if (workout) {
      const activities = flattenWorkoutActivities(workout);
      setAllActivities(activities);

      if (activities.length > 0) {
        setActivityTimeRemaining(activities[0]?.duration || 0);
      }
    }
  }, [workout]);

  // Initialize audio context and notifications
  useEffect(() => {
    if (typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }

      if ("Notification" in window) {
        setNotificationPermission(Notification.permission);
        if (Notification.permission !== "granted" && Notification.permission !== "denied") {
          Notification.requestPermission().then((permission) => {
            setNotificationPermission(permission);
          });
        }
      }
    }
  }, []);

  const playBeep = (frequency: number = 800, duration: number = 0.1) => {
    if (audioContextRef.current) {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = "sine";
      
      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.01);
      gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + duration);
      
      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration);
    }
  };

  // Timer logic
  useEffect(() => {
    let timerId: NodeJS.Timeout | undefined;

    if (isRunning) {
      timerId = setInterval(() => {
        const currentActivity = allActivities[currentActivityIndex];

        if (currentActivity && currentActivity.unit === ExerciseUnit.TIME && activityTimeRemaining > 0) {
          setActivityTimeRemaining((prev) => prev - 1);
          setTimeElapsed((prev) => prev + 1);

          if (activityTimeRemaining <= 4 && activityTimeRemaining > 1) {
            playBeep(800, 0.1);
          } else if (activityTimeRemaining === 1) {
            playBeep(600, 0.5);
          }
        } else if (currentActivity && currentActivity.unit === ExerciseUnit.TIME && activityTimeRemaining === 0) {
          if (currentActivityIndex < allActivities.length - 1) {
            const nextIndex = currentActivityIndex + 1;
            setCurrentActivityIndex(nextIndex);
            const nextActivity = allActivities[nextIndex];
            setActivityTimeRemaining(nextActivity.duration || 0);
          } else {
            setIsRunning(false);
            setCompletedWorkout(true);
          }
        }
      }, 1000);
    }

    return () => {
      if (timerId) clearInterval(timerId);
    };
  }, [isRunning, activityTimeRemaining, currentActivityIndex, allActivities]);

  const handleStart = () => {
    setCompletedWorkout(false);
    setIsRunning(true);
    
    if (audioContextRef.current && audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }
  };

  const handlePause = () => {
    setIsRunning(false);
  };

  const handleReset = () => {
    setIsRunning(false);
    setCurrentActivityIndex(0);
    setActivityTimeRemaining(allActivities[0]?.duration || 0);
    setTimeElapsed(0);
    setCompletedWorkout(false);
  };

  const handleCompleteReps = () => {
    if (currentActivityIndex < allActivities.length - 1) {
      const nextIndex = currentActivityIndex + 1;
      setCurrentActivityIndex(nextIndex);
      const nextActivity = allActivities[nextIndex];
      setActivityTimeRemaining(nextActivity.duration || 0);
    } else {
      setIsRunning(false);
      setCompletedWorkout(true);
    }
  };

  const currentActivity = allActivities[currentActivityIndex];
  const nextActivity = allActivities[currentActivityIndex + 1];
  const totalDuration = allActivities.reduce((acc, activity) => acc + (activity.duration || 0), 0);
  const isRepsExercise = currentActivity?.unit === ExerciseUnit.QUANTITY;

  return (
    <div className={`${notoSans.className} min-h-screen bg-gradient-to-br from-purple-700 to-indigo-900 text-white p-8`}>
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{workout.title}</h1>
          <p className="text-xl text-purple-200">Przygotuj się do treningu!</p>
        </header>

        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
          <ActivityDisplay
            currentActivity={currentActivity}
            nextActivity={nextActivity}
            completedWorkout={completedWorkout}
            isRepsExercise={isRepsExercise}
          />

          {!isRepsExercise ? (
            <>
              <TimerDisplay timeSeconds={activityTimeRemaining} />
              <ProgressBar
                timeRemaining={activityTimeRemaining}
                totalDuration={currentActivity?.duration || 0}
              />
            </>
          ) : (
            <RepsDisplay reps={currentActivity?.quantity} />
          )}

          <SetDisplay
            currentSet={currentActivity?.currentSet || 1}
            totalSets={currentActivity?.totalSets || 1}
          />

          <GlobalProgress timeElapsed={timeElapsed} totalDuration={totalDuration} />

          <Controls
            onStart={handleStart}
            onPause={handlePause}
            onReset={handleReset}
            onCompleteReps={handleCompleteReps}
            isRunning={isRunning}
            isRepsExercise={isRepsExercise}
          />
        </div>

        <WorkoutSetTable
          activities={allActivities}
          currentActivityIndex={currentActivityIndex}
          onSetCurrentActivity={(index) => {
            setCurrentActivityIndex(index);
            setActivityTimeRemaining(allActivities[index].duration || 0);
          }}
        />

        <div className="mt-8 text-center flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={onGoBack}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Wróć do listy treningów
          </Button>
          <Button
            variant="outline"
            onClick={onEdit}
            className="bg-white/10 hover:bg-white/20 text-white"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edytuj trening
          </Button>
        </div>
      </div>
    </div>
  );
}

// Helper components
function ActivityDisplay({ currentActivity, nextActivity, completedWorkout, isRepsExercise }: {
  currentActivity: WorkoutActivity | undefined;
  nextActivity: WorkoutActivity | undefined;
  completedWorkout: boolean;
  isRepsExercise: boolean;
}) {
  return (
    <div className="text-center mb-8">
      <AnimatePresence mode="wait">
        <motion.h2
          key={`${currentActivity?.id}-${currentActivity?.currentSet}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="text-3xl font-bold mb-4"
        >
          {completedWorkout ? (
            "🎉 Trening ukończony!"
          ) : (
            currentActivity?.name || "Przygotuj się..."
          )}
        </motion.h2>
      </AnimatePresence>
      
      {nextActivity && !completedWorkout && (
        <p className="text-lg text-purple-200 mb-2">
          Następne: {nextActivity.name}
        </p>
      )}
    </div>
  );
}

function TimerDisplay({ timeSeconds }: { timeSeconds: number }) {
  return (
    <div className="text-center mb-8">
      <div className="text-8xl font-bold font-mono">
        {formatTime(timeSeconds)}
      </div>
    </div>
  );
}

function RepsDisplay({ reps }: { reps?: number }) {
  return (
    <div className="text-center mb-8">
      <div className="text-6xl font-bold">
        {reps || 0} powtórzeń
      </div>
    </div>
  );
}

function ProgressBar({ timeRemaining, totalDuration }: {
  timeRemaining: number;
  totalDuration: number;
}) {
  const progress = totalDuration > 0 ? ((totalDuration - timeRemaining) / totalDuration) * 100 : 0;
  
  return (
    <div className="mb-8">
      <Progress value={progress} className="h-4" />
    </div>
  );
}

function SetDisplay({ currentSet, totalSets }: {
  currentSet: number;
  totalSets: number;
}) {
  return (
    <div className="text-center mb-6">
      <p className="text-lg">
        Seria {currentSet} z {totalSets}
      </p>
    </div>
  );
}

function GlobalProgress({ timeElapsed, totalDuration }: {
  timeElapsed: number;
  totalDuration: number;
}) {
  const progress = totalDuration > 0 ? (timeElapsed / totalDuration) * 100 : 0;
  
  return (
    <div className="mb-8">
      <div className="flex justify-between text-sm mb-2">
        <span>Postęp treningu</span>
        <span>{formatTime(timeElapsed)} / {formatTime(totalDuration)}</span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  );
}

function Controls({ onStart, onPause, onReset, onCompleteReps, isRunning, isRepsExercise }: {
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onCompleteReps: () => void;
  isRunning: boolean;
  isRepsExercise: boolean;
}) {
  return (
    <div className="flex justify-center gap-4 mb-8">
      {!isRunning ? (
        <Button onClick={onStart} size="lg" className="bg-green-600 hover:bg-green-700">
          <Play className="mr-2 h-5 w-5" />
          Start
        </Button>
      ) : (
        <Button onClick={onPause} size="lg" className="bg-yellow-600 hover:bg-yellow-700">
          <Pause className="mr-2 h-5 w-5" />
          Pauza
        </Button>
      )}
      
      <Button onClick={onReset} size="lg" variant="outline">
        <RotateCcw className="mr-2 h-5 w-5" />
        Reset
      </Button>
      
      {isRepsExercise && (
        <Button onClick={onCompleteReps} size="lg" className="bg-blue-600 hover:bg-blue-700">
          <Check className="mr-2 h-5 w-5" />
          Ukończ serie
        </Button>
      )}
    </div>
  );
}

function WorkoutSetTable({ activities, currentActivityIndex, onSetCurrentActivity }: {
  activities: WorkoutActivity[];
  currentActivityIndex: number;
  onSetCurrentActivity: (index: number) => void;
}) {
  return (
    <div className="mt-8 bg-white/5 rounded-2xl p-6">
      <h3 className="text-xl font-bold mb-4">Plan treningu</h3>
      <div className="space-y-2">
        {activities.map((activity, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg cursor-pointer transition-colors ${
              index === currentActivityIndex
                ? 'bg-white/20'
                : index < currentActivityIndex
                ? 'bg-green-500/20'
                : 'bg-white/10 hover:bg-white/15'
            }`}
            onClick={() => onSetCurrentActivity(index)}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{activity.name}</span>
              <div className="text-sm text-purple-200">
                {activity.unit === ExerciseUnit.TIME ? formatTime(activity.duration || 0) : `${activity.quantity} reps`}
                {activity.currentSet && activity.totalSets && ` (${activity.currentSet}/${activity.totalSets})`}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}