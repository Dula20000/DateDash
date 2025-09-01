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
  const [dragStartY, setDragStartY] = useState(0);
  const [dragStartValue, setDragStartValue] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  // Calculate rotation angle based on value
  const range = max - min;
  const normalizedValue = (value - min) / range;
  const rotation = normalizedValue * 360;

  // Generate tick marks
  const tickCount = Math.min(60, range / step);
  const ticks = Array.from({ length: tickCount }, (_, i) => {
    const angle = (i / (tickCount - 1)) * 360;
    const isMainTick = i % Math.ceil(tickCount / 12) === 0;
    return { angle, isMainTick };
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStartY(e.clientY);
    setDragStartValue(value);
    e.preventDefault();
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStartY(e.touches[0].clientY);
    setDragStartValue(value);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY - e.clientY;
      const sensitivity = 2;
      const deltaValue = (deltaY / sensitivity) * step;
      const newValue = Math.min(max, Math.max(min, dragStartValue + deltaValue));
      
      onChange(Math.round(newValue / step) * step);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging) return;
      
      const deltaY = dragStartY - e.touches[0].clientY;
      const sensitivity = 2;
      const deltaValue = (deltaY / sensitivity) * step;
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
  }, [isDragging, dragStartY, dragStartValue, min, max, step, onChange]);

  return (
    <div className={cn("bg-card border border-border rounded-xl p-6", className)}>
      <label className="block text-sm font-medium mb-4 text-foreground text-center">
        {label}
      </label>
      
      <div className="flex items-center justify-center">
        {/* Value Display */}
        <div className="absolute z-10 pointer-events-none">
          <span 
            className="text-4xl font-bold text-primary"
            data-testid={`${testId}-display`}
          >
            {value}{unit}
          </span>
        </div>

        {/* Wheel Container */}
        <div
          ref={wheelRef}
          className={cn(
            "relative w-48 h-48 cursor-grab select-none",
            isDragging && "cursor-grabbing"
          )}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          data-testid={`${testId}-wheel`}
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary/20 bg-gradient-to-br from-muted/50 to-muted/80 shadow-inner">
            {/* Inner Ring */}
            <div className="absolute inset-4 rounded-full border-2 border-primary/30 bg-gradient-to-br from-background/80 to-muted/60">
              {/* Center Hub */}
              <div className="absolute inset-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 border border-primary/50 shadow-lg" />
            </div>
          </div>

          {/* Tick Marks */}
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            {ticks.map((tick, index) => (
              <div
                key={index}
                className="absolute w-0.5 bg-primary/60 origin-bottom"
                style={{
                  height: tick.isMainTick ? '16px' : '8px',
                  left: '50%',
                  top: tick.isMainTick ? '4px' : '8px',
                  transform: `translateX(-50%) rotate(${tick.angle}deg)`,
                  transformOrigin: '50% calc(100% + 88px)'
                }}
              />
            ))}
          </div>

          {/* Rotation Indicator */}
          <div 
            className="absolute inset-0 transition-transform duration-150 ease-out"
            style={{ transform: `rotate(${rotation}deg)` }}
          >
            <div className="absolute w-1 h-6 bg-accent rounded-full shadow-lg" 
                 style={{ 
                   left: '50%', 
                   top: '-2px', 
                   transform: 'translateX(-50%)',
                   filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
                 }} 
            />
          </div>

          {/* Static Reference Marker */}
          <div className="absolute w-3 h-3 bg-secondary rounded-full shadow-lg border-2 border-background"
               style={{ 
                 left: '50%', 
                 top: '-6px', 
                 transform: 'translateX(-50%)',
                 zIndex: 10
               }} 
          />
        </div>
      </div>

      {/* Range Indicators */}
      <div className="flex justify-between text-xs text-muted-foreground mt-4 px-4">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}