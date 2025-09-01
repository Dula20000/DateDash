import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExerciseSchema, insertWorkoutSchema, insertWorkoutSetSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Exercise routes
  app.get("/api/exercises", async (req, res) => {
    try {
      const exercises = await storage.getExercises();
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises" });
    }
  });

  app.get("/api/exercises/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const exercises = await storage.getExercisesByCategory(category);
      res.json(exercises);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercises by category" });
    }
  });

  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid exercise data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create exercise" });
      }
    }
  });

  // Workout routes
  app.post("/api/workouts", async (req, res) => {
    try {
      const workoutData = insertWorkoutSchema.parse(req.body);
      const workout = await storage.createWorkout(workoutData);
      res.json(workout);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid workout data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create workout" });
      }
    }
  });

  app.get("/api/workouts/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const workout = await storage.getWorkoutWithSets(id);
      if (!workout) {
        res.status(404).json({ message: "Workout not found" });
        return;
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout" });
    }
  });

  app.get("/api/users/:userId/workouts", async (req, res) => {
    try {
      const { userId } = req.params;
      const workouts = await storage.getWorkouts(userId);
      res.json(workouts);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workouts" });
    }
  });

  app.patch("/api/workouts/:id/finish", async (req, res) => {
    try {
      const { id } = req.params;
      const workout = await storage.finishWorkout(id, new Date());
      if (!workout) {
        res.status(404).json({ message: "Workout not found" });
        return;
      }
      res.json(workout);
    } catch (error) {
      res.status(500).json({ message: "Failed to finish workout" });
    }
  });

  // Workout sets routes
  app.post("/api/workout-sets", async (req, res) => {
    try {
      const setData = insertWorkoutSetSchema.parse(req.body);
      const workoutSet = await storage.addWorkoutSet(setData);
      res.json(workoutSet);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid set data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add set" });
      }
    }
  });

  app.get("/api/workouts/:workoutId/sets", async (req, res) => {
    try {
      const { workoutId } = req.params;
      const sets = await storage.getWorkoutSets(workoutId);
      res.json(sets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch workout sets" });
    }
  });

  app.delete("/api/workout-sets/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteWorkoutSet(id);
      if (!deleted) {
        res.status(404).json({ message: "Set not found" });
        return;
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete set" });
    }
  });

  // Progress routes
  app.get("/api/users/:userId/progress/:exerciseId", async (req, res) => {
    try {
      const { userId, exerciseId } = req.params;
      const { timeframe } = req.query;
      const progress = await storage.getExerciseProgress(userId, exerciseId, timeframe as string);
      if (!progress) {
        res.status(404).json({ message: "Exercise progress not found" });
        return;
      }
      res.json(progress);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exercise progress" });
    }
  });

  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const { userId } = req.params;
      const { timeframe } = req.query;
      const stats = await storage.getUserStats(userId, timeframe as string);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
