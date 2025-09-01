import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface WorkoutSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
  testId?: string;
}

export default function WorkoutSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
  testId
}: WorkoutSliderProps) {
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleChange = (newValue: number) => {
    setInternalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className={cn("bg-card border border-border rounded-xl p-4", className)}>
      <label className="block text-sm font-medium mb-3 text-foreground">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <span 
          className="text-3xl font-bold text-primary min-w-20"
          data-testid={`${testId}-display`}
        >
          {internalValue}{unit}
        </span>
        <div className="flex-1">
          <input
            type="range"
            className="workout-slider w-full"
            min={min}
            max={max}
            value={internalValue}
            step={step}
            onChange={(e) => handleChange(Number(e.target.value))}
            data-testid={`${testId}-slider`}
          />
        </div>
      </div>
    </div>
  );
}
