import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import ExerciseSelection from "@/components/exercise-selection";
import ExerciseLogging from "@/components/exercise-logging";
import { categories, mockUserId } from "@/lib/fitness-data";
import { apiRequest } from "@/lib/queryClient";
import { Exercise, InsertWorkout } from "@shared/schema";

type WorkoutState = "category" | "exercise-selection" | "exercise-logging";

export default function Workout() {
  const [state, setState] = useState<WorkoutState>("category");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [currentWorkoutId, setCurrentWorkoutId] = useState<string | null>(null);
  const [unit, setUnit] = useState<"lbs" | "kg">("lbs");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createWorkoutMutation = useMutation({
    mutationFn: async (workoutData: InsertWorkout) => {
      const response = await apiRequest("POST", "/api/workouts", workoutData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", mockUserId, "workouts"] });
    }
  });

  const finishWorkoutMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      const response = await apiRequest("PATCH", `/api/workouts/${workoutId}/finish`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users", mockUserId, "workouts"] });
    }
  });

  const handleCategorySelect = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    
    if (!currentWorkoutId) {
      // Create new workout
      const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
      const workoutData: InsertWorkout = {
        userId: mockUserId,
        name: `${categoryName} Workout`,
        category: categoryId,
        startTime: new Date()
      };

      try {
        const workout = await createWorkoutMutation.mutateAsync(workoutData);
        setCurrentWorkoutId(workout.id);
        setState("exercise-selection");
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to start workout",
          variant: "destructive"
        });
      }
    } else {
      setState("exercise-selection");
    }
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setState("exercise-logging");
  };

  const handleFinishExercise = () => {
    setSelectedExercise(null);
    setState("exercise-selection");
    toast({
      title: "Exercise completed",
      description: "Exercise logged successfully"
    });
  };

  const handleAddAnotherExercise = () => {
    setSelectedExercise(null);
    setState("exercise-selection");
  };

  const handleFinishWorkout = async () => {
    if (!currentWorkoutId) return;

    try {
      await finishWorkoutMutation.mutateAsync(currentWorkoutId);
      toast({
        title: "Workout completed",
        description: "Great job! Your workout has been saved."
      });
      
      // Reset state
      setCurrentWorkoutId(null);
      setSelectedCategory("");
      setSelectedExercise(null);
      setState("category");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to finish workout",
        variant: "destructive"
      });
    }
  };

  const handleAddCustomExercise = () => {
    toast({
      title: "Coming soon",
      description: "Custom exercise creation will be available soon"
    });
  };

  return (
    <div className="p-6 pb-20">
      {/* Header */}
      <div className="flex items-center mb-6">
        {state !== "category" ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (state === "exercise-logging") {
                setState("exercise-selection");
              } else {
                setState("category");
              }
            }}
            className="mr-4 p-2 rounded-lg hover:bg-muted app-transition"
            data-testid="back-button"
          >
            <ArrowLeft size={20} />
          </Button>
        ) : (
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="mr-4 p-2 rounded-lg hover:bg-muted app-transition"
              data-testid="home-button"
            >
              <ArrowLeft size={20} />
            </Button>
          </Link>
        )}
        <h1 className="text-2xl font-bold text-foreground">
          {state === "category" ? "New Workout" : 
           state === "exercise-selection" ? "Select Exercise" : 
           "Log Exercise"}
        </h1>
      </div>

      {/* Category Selection */}
      {state === "category" && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-foreground">Select Category</h2>
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Button
                  key={category.id}
                  variant="outline"
                  className="p-4 h-auto flex-col text-center hover:border-primary app-transition"
                  onClick={() => handleCategorySelect(category.id)}
                  data-testid={`category-${category.id}`}
                >
                  <Icon className="text-2xl mb-2 text-primary" size={24} />
                  <span className="font-medium">{category.name}</span>
                  <span className="text-xs text-muted-foreground mt-1">
                    {category.description}
                  </span>
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Exercise Selection */}
      {state === "exercise-selection" && (
        <ExerciseSelection
          category={selectedCategory}
          onSelectExercise={handleExerciseSelect}
          onAddCustomExercise={handleAddCustomExercise}
        />
      )}

      {/* Exercise Logging */}
      {state === "exercise-logging" && selectedExercise && currentWorkoutId && (
        <ExerciseLogging
          exercise={selectedExercise}
          workoutId={currentWorkoutId}
          unit={unit}
          onToggleUnit={() => setUnit(unit === "lbs" ? "kg" : "lbs")}
          onFinishExercise={handleFinishExercise}
          onAddAnotherExercise={handleAddAnotherExercise}
        />
      )}

      {/* Finish Workout Button (only show when we have an active workout) */}
      {currentWorkoutId && (state === "exercise-selection" || state === "exercise-logging") && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6">
          <Button
            onClick={handleFinishWorkout}
            className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold py-3"
            disabled={finishWorkoutMutation.isPending}
            data-testid="finish-workout"
          >
            {finishWorkoutMutation.isPending ? "Finishing..." : "Finish Workout"}
          </Button>
        </div>
      )}
    </div>
  );
}
