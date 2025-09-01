import { Dumbbell, User, ArrowUp, Hand, HandMetal, PersonStanding } from "lucide-react";

export const categories = [
  { 
    id: "upper-body", 
    name: "Upper Body", 
    icon: Dumbbell,
    description: "Chest, shoulders, arms"
  },
  { 
    id: "lower-body", 
    name: "Lower Body", 
    icon: PersonStanding,
    description: "Legs, glutes, hips"
  },
  { 
    id: "back", 
    name: "Back", 
    icon: ArrowUp,
    description: "Lats, rhomboids, traps"
  },
  { 
    id: "push", 
    name: "Push", 
    icon: Hand,
    description: "Pushing movements"
  },
  { 
    id: "pull", 
    name: "Pull", 
    icon: HandMetal,
    description: "Pulling movements"
  },
  { 
    id: "legs", 
    name: "Legs", 
    icon: PersonStanding,
    description: "Lower body focus"
  }
];

export const mockUserId = "user-1"; // For demo purposes

export function convertWeight(weight: number, fromUnit: string, toUnit: string): number {
  if (fromUnit === toUnit) return weight;
  
  if (fromUnit === "lbs" && toUnit === "kg") {
    return Math.round((weight / 2.205) * 100) / 100;
  }
  
  if (fromUnit === "kg" && toUnit === "lbs") {
    return Math.round((weight * 2.205) * 100) / 100;
  }
  
  return weight;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric' 
  });
}
