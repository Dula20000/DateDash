import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WheelSliderProps {
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

export default function WheelSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
  className,
  testId
}: WheelSliderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Calculate rotation based on value
  const range = max - min;
  const normalizedValue = (value - min) / range;
  const targetRotation = normalizedValue * 360;

  useEffect(() => {
    setRotation(targetRotation);
  }, [targetRotation]);

  // Generate ridges for the wheel edge
  const ridgeCount = 40;
  const ridges = Array.from({ length: ridgeCount }, (_, i) => {
    const angle = (i / ridgeCount) * 360;
    const isMainRidge = i % 5 === 0;
    return { angle, isMainRidge };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartValue(value);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartX(e.touches[0].clientX);
    setDragStartValue(value);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.clientX - dragStartX;
      const sensitivity = 3;
      const deltaValue = (deltaX / sensitivity) * step;
      const newValue = Math.min(max, Math.max(min, dragStartValue + deltaValue));
      
      onChange(Math.round(newValue / step) * step);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const deltaX = e.touches[0].clientX - dragStartX;
      const sensitivity = 3;
      const deltaValue = (deltaX / sensitivity) * step;
      const newValue = Math.min(max, Math.max(min, dragStartValue + deltaValue));
      
      onChange(Math.round(newValue / step) * step);
      e.preventDefault();
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleEnd);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleEnd);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, dragStartX, dragStartValue, min, max, step, onChange]);

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <label className="block text-sm font-medium mb-4 text-foreground text-center">
        {label}
      </label>
      
      <div className="flex items-center justify-center relative">
        {/* Value Display */}
        <div className="absolute z-20 pointer-events-none">
          <span 
            className="text-4xl font-bold text-primary drop-shadow-lg"
            data-testid={`${testId}-display`}
          >
            {value}{unit}
          </span>
        </div>

        {/* Wheel Side Profile Container */}
        <div
          ref={wheelRef}
          className={cn(
            "relative w-64 h-32 cursor-grab select-none",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          data-testid={`${testId}-wheel`}
        >
          {/* Main Wheel Body - Elliptical shape for side view */}
          <div className="absolute inset-0 bg-gradient-to-br from-muted via-background to-muted/80 rounded-full border-2 border-primary/30 shadow-lg overflow-hidden">
            
            {/* Inner metallic surface */}
            <div className="absolute inset-2 bg-gradient-to-r from-primary/10 via-background to-primary/10 rounded-full border border-primary/20" />
            
            {/* Ridged Edge - Top */}
            <div 
              className="absolute top-0 left-0 right-0 h-4 overflow-hidden"
              style={{ transform: `translateX(${(rotation / 360) * -20}px)` }}
            >
              <div className="flex h-full">
                {Array.from({ length: ridgeCount * 2 }, (_, i) => {
                  const isMainRidge = i % 5 === 0;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-shrink-0 bg-gradient-to-b transition-all duration-100",
                        isMainRidge 
                          ? "w-2 from-primary/60 to-primary/30" 
                          : "w-1 from-primary/40 to-primary/20"
                      )}
                      style={{
                        height: isMainRidge ? '16px' : '12px',
                        marginRight: '1px'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Ridged Edge - Bottom */}
            <div 
              className="absolute bottom-0 left-0 right-0 h-4 overflow-hidden"
              style={{ transform: `translateX(${(rotation / 360) * 20}px)` }}
            >
              <div className="flex h-full">
                {Array.from({ length: ridgeCount * 2 }, (_, i) => {
                  const isMainRidge = i % 5 === 0;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "flex-shrink-0 bg-gradient-to-t transition-all duration-100",
                        isMainRidge 
                          ? "w-2 from-primary/60 to-primary/30" 
                          : "w-1 from-primary/40 to-primary/20"
                      )}
                      style={{
                        height: isMainRidge ? '16px' : '12px',
                        marginRight: '1px'
                      }}
                    />
                  );
                })}
              </div>
            </div>

            {/* Left Edge Highlight */}
            <div className="absolute left-0 top-4 bottom-4 w-2 bg-gradient-to-r from-primary/50 to-transparent rounded-l-full" />
            
            {/* Right Edge Shadow */}
            <div className="absolute right-0 top-4 bottom-4 w-2 bg-gradient-to-l from-black/20 to-transparent rounded-r-full" />

            {/* Center groove lines */}
            <div className="absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transform -translate-y-0.5" />
            <div className="absolute top-1/2 left-4 right-4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent transform translate-y-0.5" />
          </div>

          {/* Interactive zones for better UX */}
          <div className="absolute inset-0 rounded-full" />
        </div>
      </div>

      {/* Range Indicators */}
      <div className="flex justify-between text-xs text-muted-foreground mt-4 px-4">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
      
      {/* Direction Hint */}
      <div className="text-center mt-2">
        <span className="text-xs text-muted-foreground">← Drag to adjust →</span>
      </div>
    </div>
  );
}