import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, decimal, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const exercises = pgTable("exercises", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  category: text("category").notNull(), // 'upper-body', 'lower-body', 'back', 'push', 'pull', 'legs', 'full-body'
  muscleGroups: text("muscle_groups").array().notNull(), // ['chest', 'triceps', 'shoulders']
  isCustom: boolean("is_custom").default(false),
  userId: varchar("user_id").references(() => users.id),
});

export const workouts = pgTable("workouts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // in minutes
});

export const workoutSets = pgTable("workout_sets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  workoutId: varchar("workout_id").references(() => workouts.id).notNull(),
  exerciseId: varchar("exercise_id").references(() => exercises.id).notNull(),
  setNumber: integer("set_number").notNull(),
  weight: decimal("weight", { precision: 6, scale: 2 }).notNull(),
  reps: integer("reps").notNull(),
  unit: text("unit").notNull().default("lbs"), // 'lbs' or 'kg'
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({
  id: true,
  endTime: true,
  duration: true,
});

export const insertWorkoutSetSchema = createInsertSchema(workoutSets).omit({
  id: true,
  completedAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type Workout = typeof workouts.$inferSelect;
export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;

export type WorkoutSet = typeof workoutSets.$inferSelect;
export type InsertWorkoutSet = z.infer<typeof insertWorkoutSetSchema>;

// Derived types for complex queries
export type WorkoutWithSets = Workout & {
  sets: (WorkoutSet & { exercise: Exercise })[];
};

export type ExerciseProgress = {
  exerciseId: string;
  exerciseName: string;
  sessions: {
    date: string;
    maxWeight: number;
    totalVolume: number;
    sets: number;
  }[];
};
