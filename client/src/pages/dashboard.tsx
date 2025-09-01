import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Plus, BarChart3, Dumbbell, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate, formatShortDate, mockUserId } from "@/lib/fitness-data";
import { Workout } from "@shared/schema";

export default function Dashboard() {
  const { data: workouts = [], isLoading } = useQuery({
    queryKey: ["/api/users", mockUserId, "workouts"]
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/users", mockUserId, "stats"]
  });

  const recentWorkouts = workouts.slice(0, 3);
  const lastWorkout = workouts[0];

  return (
    <div className="p-6 pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2" data-testid="app-title">
          FitTrack Pro
        </h1>
        <p className="text-muted-foreground" data-testid="current-date">
          {formatDate(new Date())}
        </p>
      </div>

      {/* Quick Stats Card */}
      <div className="bg-gradient-to-r from-primary to-secondary rounded-xl p-6 mb-6 text-primary-foreground">
        <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm opacity-90">Last Workout</p>
            <p className="text-xl font-bold" data-testid="last-workout">
              {lastWorkout ? formatShortDate(new Date(lastWorkout.startTime)) : "None yet"}
            </p>
          </div>
          <div>
            <p className="text-sm opacity-90">This Week</p>
            <p className="text-xl font-bold" data-testid="weekly-volume">
              {stats ? `${Math.round(stats.totalVolume).toLocaleString()} lbs` : "0 lbs"}
            </p>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="space-y-4 mb-6">
        <Link href="/workout">
          <Button 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-4 px-6 rounded-xl app-transition flex items-center justify-center"
            data-testid="start-new-workout"
          >
            <Plus className="mr-3" size={20} />
            Start New Workout
          </Button>
        </Link>
        
        <Link href="/progress">
          <Button 
            variant="outline"
            className="w-full font-semibold py-4 px-6 rounded-xl app-transition flex items-center justify-center"
            data-testid="view-progress"
          >
            <BarChart3 className="mr-3" size={20} />
            View Progress
          </Button>
        </Link>
      </div>

      {/* Recent Workouts */}
      <Card className="border border-border rounded-xl">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-foreground">Recent Workouts</h3>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout: Workout) => (
                <div 
                  key={workout.id} 
                  className="flex items-center justify-between py-2"
                  data-testid={`recent-workout-${workout.id}`}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                      <Dumbbell className="text-primary" size={16} />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{workout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {workout.category.replace('-', ' ')} • {workout.duration || '0'} min
                      </p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {formatShortDate(new Date(workout.startTime))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Dumbbell className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground mb-4">No workouts yet</p>
              <Link href="/workout">
                <Button variant="outline" data-testid="start-first-workout">
                  <Plus className="mr-2" size={16} />
                  Start Your First Workout
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
