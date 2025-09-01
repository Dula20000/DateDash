import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import WheelSlider from "./wheel-slider";
import { apiRequest } from "@/lib/queryClient";
import { Exercise, InsertWorkoutSet } from "@shared/schema";
import { convertWeight } from "@/lib/fitness-data";

interface LoggedSet {
  id?: string;
  setNumber: number;
  weight: number;
  reps: number;
  unit: string;
}

interface ExerciseLoggingProps {
  exercise: Exercise;
  workoutId: string;
  unit: "lbs" | "kg";
  onToggleUnit: () => void;
  onFinishExercise: () => void;
  onAddAnotherExercise: () => void;
}

export default function ExerciseLogging({
  exercise,
  workoutId,
  unit,
  onToggleUnit,
  onFinishExercise,
  onAddAnotherExercise
}: ExerciseLoggingProps) {
  const [weight, setWeight] = useState(unit === "lbs" ? 185 : 85);
  const [sets, setSets] = useState(3);
  const [reps, setReps] = useState(8);
  const [loggedSets, setLoggedSets] = useState<LoggedSet[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSetMutation = useMutation({
    mutationFn: async (setData: InsertWorkoutSet) => {
      const response = await apiRequest("POST", "/api/workout-sets", setData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId, "sets"] });
    }
  });

  const deleteSetMutation = useMutation({
    mutationFn: async (setId: string) => {
      await apiRequest("DELETE", `/api/workout-sets/${setId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workouts", workoutId, "sets"] });
    }
  });

  const handleWeightChange = (newWeight: number) => {
    setWeight(newWeight);
  };

  const handleUnitToggle = () => {
    const convertedWeight = convertWeight(weight, unit, unit === "lbs" ? "kg" : "lbs");
    setWeight(Math.round(convertedWeight));
    onToggleUnit();
  };

  const handleAddSet = async () => {
    const setData: InsertWorkoutSet = {
      workoutId,
      exerciseId: exercise.id,
      setNumber: loggedSets.length + 1,
      weight: weight.toString(),
      reps,
      unit
    };

    try {
      const result = await addSetMutation.mutateAsync(setData);
      const newSet: LoggedSet = {
        id: result.id,
        setNumber: loggedSets.length + 1,
        weight,
        reps,
        unit
      };
      
      setLoggedSets(prev => [...prev, newSet]);
      
      toast({
        title: "Set added",
        description: `${weight} ${unit} × ${reps} reps logged successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add set",
        variant: "destructive"
      });
    }
  };

  const handleDeleteSet = async (setId: string, index: number) => {
    try {
      if (setId) {
        await deleteSetMutation.mutateAsync(setId);
      }
      
      setLoggedSets(prev => prev.filter((_, i) => i !== index));
      
      toast({
        title: "Set removed",
        description: "Set deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete set",
        variant: "destructive"
      });
    }
  };

  const maxWeight = unit === "lbs" ? 500 : 250;
  const weightStep = unit === "lbs" ? 5 : 2.5;

  return (
    <div>
      <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-4 mb-6 border border-primary/20">
        <h3 className="font-bold text-lg mb-1" data-testid="selected-exercise-name">
          {exercise.name}
        </h3>
        <p className="text-muted-foreground text-sm">
          {exercise.muscleGroups.join(", ")}
        </p>
      </div>

      {/* Unit Toggle */}
      <div className="flex justify-center mb-6">
        <div className="bg-muted rounded-xl p-1 flex">
          <Button
            variant={unit === "lbs" ? "default" : "ghost"}
            size="sm"
            onClick={() => unit !== "lbs" && handleUnitToggle()}
            className="px-6 py-2 rounded-lg font-medium"
            data-testid="unit-lbs"
          >
            Lbs
          </Button>
          <Button
            variant={unit === "kg" ? "default" : "ghost"}
            size="sm"
            onClick={() => unit !== "kg" && handleUnitToggle()}
            className="px-6 py-2 rounded-lg font-medium"
            data-testid="unit-kg"
          >
            Kg
          </Button>
        </div>
      </div>

      {/* Wheel Sliders */}
      <div className="space-y-8 mb-6">
        <WheelSlider
          label="Weight"
          value={weight}
          min={0}
          max={maxWeight}
          step={weightStep}
          unit={` ${unit}`}
          onChange={handleWeightChange}
          testId="weight"
        />
        
        <WheelSlider
          label="Sets"
          value={sets}
          min={1}
          max={10}
          onChange={setSets}
          testId="sets"
        />
        
        <WheelSlider
          label="Reps"
          value={reps}
          min={1}
          max={20}
          onChange={setReps}
          testId="reps"
        />
      </div>

      {/* Logged Sets */}
      {loggedSets.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold mb-3 text-foreground">Logged Sets</h4>
          <div className="space-y-2">
            {loggedSets.map((set, index) => (
              <div 
                key={index}
                className="flex items-center justify-between bg-muted/50 rounded-lg p-3"
                data-testid={`logged-set-${index}`}
              >
                <span className="text-sm text-muted-foreground">
                  Set {set.setNumber}
                </span>
                <span className="font-medium">
                  {set.weight} {set.unit} × {set.reps} reps
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/80 p-1"
                  onClick={() => handleDeleteSet(set.id || "", index)}
                  data-testid={`delete-set-${index}`}
                >
                  <Trash2 size={16} />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button
          onClick={handleAddSet}
          className="w-full bg-accent hover:bg-accent/90 text-accent-foreground font-semibold"
          disabled={addSetMutation.isPending}
          data-testid="add-set"
        >
          <Plus className="mr-2" size={18} />
          {addSetMutation.isPending ? "Adding..." : "Add Set"}
        </Button>
        
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={onFinishExercise}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-semibold"
            data-testid="finish-exercise"
          >
            Finish Exercise
          </Button>
          <Button
            onClick={onAddAnotherExercise}
            variant="outline"
            className="font-semibold"
            data-testid="add-another-exercise"
          >
            Add Exercise
          </Button>
        </div>
      </div>
    </div>
  );
}
