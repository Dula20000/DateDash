import { type User, type InsertUser, type Exercise, type InsertExercise, type Workout, type InsertWorkout, type WorkoutSet, type InsertWorkoutSet, type WorkoutWithSets, type ExerciseProgress } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Exercise methods
  getExercises(): Promise<Exercise[]>;
  getExercisesByCategory(category: string): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  getExercise(id: string): Promise<Exercise | undefined>;
  
  // Workout methods
  createWorkout(workout: InsertWorkout): Promise<Workout>;
  getWorkout(id: string): Promise<Workout | undefined>;
  getWorkouts(userId: string): Promise<Workout[]>;
  getWorkoutWithSets(workoutId: string): Promise<WorkoutWithSets | undefined>;
  finishWorkout(workoutId: string, endTime: Date): Promise<Workout | undefined>;
  
  // Workout set methods
  addWorkoutSet(workoutSet: InsertWorkoutSet): Promise<WorkoutSet>;
  getWorkoutSets(workoutId: string): Promise<(WorkoutSet & { exercise: Exercise })[]>;
  deleteWorkoutSet(setId: string): Promise<boolean>;
  
  // Progress methods
  getExerciseProgress(userId: string, exerciseId: string, timeframe?: string): Promise<ExerciseProgress | undefined>;
  getUserStats(userId: string, timeframe?: string): Promise<{
    totalVolume: number;
    averageImprovement: number;
    personalBests: { exerciseName: string; weight: number; reps: number; date: string }[];
    mostFrequentExercise: string;
    averageRepsPerSet: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private exercises: Map<string, Exercise>;
  private workouts: Map<string, Workout>;
  private workoutSets: Map<string, WorkoutSet>;

  constructor() {
    this.users = new Map();
    this.exercises = new Map();
    this.workouts = new Map();
    this.workoutSets = new Map();
    
    // Initialize with default exercises
    this.initializeDefaultExercises();
  }

  private initializeDefaultExercises() {
    const defaultExercises: Exercise[] = [
      { id: randomUUID(), name: "Bench Press", category: "upper-body", muscleGroups: ["chest", "triceps", "shoulders"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Overhead Press", category: "upper-body", muscleGroups: ["shoulders", "triceps"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Incline Bench Press", category: "upper-body", muscleGroups: ["chest", "shoulders"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Dips", category: "push", muscleGroups: ["triceps", "chest"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Push-ups", category: "push", muscleGroups: ["chest", "triceps", "shoulders"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Pull-ups", category: "pull", muscleGroups: ["lats", "biceps"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Rows", category: "pull", muscleGroups: ["lats", "rhomboids", "biceps"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Lat Pulldowns", category: "pull", muscleGroups: ["lats", "biceps"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Bicep Curls", category: "pull", muscleGroups: ["biceps"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Squats", category: "lower-body", muscleGroups: ["quadriceps", "glutes"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Deadlifts", category: "lower-body", muscleGroups: ["hamstrings", "glutes", "back"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Lunges", category: "legs", muscleGroups: ["quadriceps", "glutes"], isCustom: false, userId: null },
      { id: randomUUID(), name: "Calf Raises", category: "legs", muscleGroups: ["calves"], isCustom: false, userId: null },
    ];

    defaultExercises.forEach(exercise => {
      this.exercises.set(exercise.id, exercise);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async getExercisesByCategory(category: string): Promise<Exercise[]> {
    return Array.from(this.exercises.values()).filter(
      exercise => exercise.category === category
    );
  }

  async createExercise(insertExercise: InsertExercise): Promise<Exercise> {
    const id = randomUUID();
    const exercise: Exercise = { ...insertExercise, id };
    this.exercises.set(id, exercise);
    return exercise;
  }

  async getExercise(id: string): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const id = randomUUID();
    const workout: Workout = { 
      ...insertWorkout, 
      id,
      endTime: null,
      duration: null
    };
    this.workouts.set(id, workout);
    return workout;
  }

  async getWorkout(id: string): Promise<Workout | undefined> {
    return this.workouts.get(id);
  }

  async getWorkouts(userId: string): Promise<Workout[]> {
    return Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId)
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }

  async getWorkoutWithSets(workoutId: string): Promise<WorkoutWithSets | undefined> {
    const workout = this.workouts.get(workoutId);
    if (!workout) return undefined;

    const sets = await this.getWorkoutSets(workoutId);
    return { ...workout, sets };
  }

  async finishWorkout(workoutId: string, endTime: Date): Promise<Workout | undefined> {
    const workout = this.workouts.get(workoutId);
    if (!workout) return undefined;

    const duration = Math.round((endTime.getTime() - new Date(workout.startTime).getTime()) / (1000 * 60));
    const updatedWorkout = { ...workout, endTime, duration };
    this.workouts.set(workoutId, updatedWorkout);
    return updatedWorkout;
  }

  async addWorkoutSet(insertWorkoutSet: InsertWorkoutSet): Promise<WorkoutSet> {
    const id = randomUUID();
    const workoutSet: WorkoutSet = { 
      ...insertWorkoutSet, 
      id,
      completedAt: new Date()
    };
    this.workoutSets.set(id, workoutSet);
    return workoutSet;
  }

  async getWorkoutSets(workoutId: string): Promise<(WorkoutSet & { exercise: Exercise })[]> {
    const sets = Array.from(this.workoutSets.values())
      .filter(set => set.workoutId === workoutId)
      .sort((a, b) => a.setNumber - b.setNumber);

    return sets.map(set => {
      const exercise = this.exercises.get(set.exerciseId)!;
      return { ...set, exercise };
    });
  }

  async deleteWorkoutSet(setId: string): Promise<boolean> {
    return this.workoutSets.delete(setId);
  }

  async getExerciseProgress(userId: string, exerciseId: string, timeframe = "all"): Promise<ExerciseProgress | undefined> {
    const exercise = this.exercises.get(exerciseId);
    if (!exercise) return undefined;

    const userWorkouts = Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId);

    const exerciseSets = Array.from(this.workoutSets.values())
      .filter(set => set.exerciseId === exerciseId && 
        userWorkouts.some(workout => workout.id === set.workoutId));

    // Group by workout/date
    const sessionMap = new Map<string, { date: string; sets: WorkoutSet[] }>();
    
    exerciseSets.forEach(set => {
      const workout = userWorkouts.find(w => w.id === set.workoutId);
      if (!workout) return;

      const dateKey = new Date(workout.startTime).toISOString().split('T')[0];
      if (!sessionMap.has(dateKey)) {
        sessionMap.set(dateKey, { date: dateKey, sets: [] });
      }
      sessionMap.get(dateKey)!.sets.push(set);
    });

    const sessions = Array.from(sessionMap.values()).map(session => ({
      date: session.date,
      maxWeight: Math.max(...session.sets.map(s => parseFloat(s.weight))),
      totalVolume: session.sets.reduce((total, set) => 
        total + (parseFloat(set.weight) * set.reps), 0),
      sets: session.sets.length
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      exerciseId,
      exerciseName: exercise.name,
      sessions
    };
  }

  async getUserStats(userId: string, timeframe = "month"): Promise<{
    totalVolume: number;
    averageImprovement: number;
    personalBests: { exerciseName: string; weight: number; reps: number; date: string }[];
    mostFrequentExercise: string;
    averageRepsPerSet: number;
  }> {
    const userWorkouts = Array.from(this.workouts.values())
      .filter(workout => workout.userId === userId);

    const allSets = Array.from(this.workoutSets.values())
      .filter(set => userWorkouts.some(workout => workout.id === set.workoutId));

    const totalVolume = allSets.reduce((total, set) => 
      total + (parseFloat(set.weight) * set.reps), 0);

    const averageRepsPerSet = allSets.length > 0 ? 
      allSets.reduce((total, set) => total + set.reps, 0) / allSets.length : 0;

    // Calculate personal bests
    const exerciseBests = new Map<string, { weight: number; reps: number; date: string }>();
    allSets.forEach(set => {
      const exercise = this.exercises.get(set.exerciseId);
      if (!exercise) return;

      const current = exerciseBests.get(set.exerciseId);
      const weight = parseFloat(set.weight);
      
      if (!current || weight > current.weight) {
        exerciseBests.set(set.exerciseId, {
          weight,
          reps: set.reps,
          date: set.completedAt.toISOString().split('T')[0]
        });
      }
    });

    const personalBests = Array.from(exerciseBests.entries()).map(([exerciseId, best]) => {
      const exercise = this.exercises.get(exerciseId)!;
      return {
        exerciseName: exercise.name,
        weight: best.weight,
        reps: best.reps,
        date: best.date
      };
    });

    // Most frequent exercise
    const exerciseFrequency = new Map<string, number>();
    allSets.forEach(set => {
      const count = exerciseFrequency.get(set.exerciseId) || 0;
      exerciseFrequency.set(set.exerciseId, count + 1);
    });

    let mostFrequentExerciseId = "";
    let maxFrequency = 0;
    exerciseFrequency.forEach((frequency, exerciseId) => {
      if (frequency > maxFrequency) {
        maxFrequency = frequency;
        mostFrequentExerciseId = exerciseId;
      }
    });

    const mostFrequentExercise = mostFrequentExerciseId ? 
      this.exercises.get(mostFrequentExerciseId)?.name || "" : "";

    // Calculate average improvement (simplified)
    const averageImprovement = 15; // Placeholder calculation

    return {
      totalVolume,
      averageImprovement,
      personalBests,
      mostFrequentExercise,
      averageRepsPerSet
    };
  }
}

export const storage = new MemStorage();
