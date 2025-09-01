import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Exercise } from "@shared/schema";

interface ExerciseSelectionProps {
  category: string;
  onSelectExercise: (exercise: Exercise) => void;
  onAddCustomExercise: () => void;
}

export default function ExerciseSelection({ 
  category, 
  onSelectExercise, 
  onAddCustomExercise 
}: ExerciseSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: exercises = [], isLoading } = useQuery({
    queryKey: ["/api/exercises/category", category],
    enabled: !!category
  });

  const filteredExercises = exercises.filter((exercise: Exercise) =>
    exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exercise.muscleGroups.some(group => 
      group.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            placeholder="Search exercises..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="exercise-search"
          />
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {filteredExercises.map((exercise: Exercise) => (
          <button
            key={exercise.id}
            onClick={() => onSelectExercise(exercise)}
            className="w-full text-left p-4 bg-card border border-border rounded-xl hover:border-primary app-transition"
            data-testid={`exercise-${exercise.id}`}
          >
            <div className="font-medium text-foreground">{exercise.name}</div>
            <div className="text-sm text-muted-foreground">
              {exercise.muscleGroups.join(", ")}
            </div>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full p-4 border-2 border-dashed border-muted-foreground/30 rounded-xl text-muted-foreground hover:border-primary hover:text-primary app-transition"
        onClick={onAddCustomExercise}
        data-testid="add-custom-exercise"
      >
        <Plus className="mr-2" size={18} />
        Add Custom Exercise
      </Button>
    </div>
  );
}
