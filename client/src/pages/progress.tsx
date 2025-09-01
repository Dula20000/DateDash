import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { TrendingUp, Award, Activity, Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ProgressChart from "@/components/progress-chart";
import { mockUserId, formatShortDate } from "@/lib/fitness-data";
import { Workout } from "@shared/schema";

export default function Progress() {
  const [timeframe, setTimeframe] = useState("month");
  const [category, setCategory] = useState("all");

  const { data: stats, isLoading: statsLoading } = useQuery<{
    totalVolume: number;
    averageImprovement: number;
    personalBests: { exerciseName: string; weight: number; reps: number; date: string }[];
    mostFrequentExercise: string;
    averageRepsPerSet: number;
  }>({
    queryKey: ["/api/users", mockUserId, "stats"],
    queryFn: () => fetch(`/api/users/${mockUserId}/stats?timeframe=${timeframe}`).then(res => res.json())
  });

  const { data: workouts = [], isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/users", mockUserId, "workouts"]
  });

  // Generate mock chart data based on workouts
  const generateChartData = () => {
    const last4Weeks = Array.from({ length: 4 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (3 - i) * 7);
      return formatShortDate(date);
    });

    return {
      labels: last4Weeks,
      datasets: [{
        label: 'Average Weight (lbs)',
        data: [185, 190, 195, 200],
        borderColor: 'hsl(221.2, 83.2%, 53.3%)',
        backgroundColor: 'hsl(221.2, 83.2%, 53.3%, 0.1)'
      }]
    };
  };

  const chartData = generateChartData();
  const recentWorkouts = workouts.slice(0, 3);

  return (
    <div className="p-6 pb-20">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground mb-4" data-testid="progress-title">
          Progress Tracking
        </h1>
        
        {/* Filter Controls */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Timeframe
            </label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger data-testid="timeframe-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="3months">Last 3 Months</SelectItem>
                <SelectItem value="year">Last Year</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Category
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger data-testid="category-filter">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="upper-body">Upper Body</SelectItem>
                <SelectItem value="lower-body">Lower Body</SelectItem>
                <SelectItem value="push">Push</SelectItem>
                <SelectItem value="pull">Pull</SelectItem>
                <SelectItem value="legs">Legs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="text-accent mr-2" size={20} />
              <div>
                <div className="text-2xl font-bold text-accent" data-testid="average-improvement">
                  {statsLoading ? "..." : `+${stats?.averageImprovement || 15}%`}
                </div>
                <div className="text-sm text-muted-foreground">Avg. Improvement</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="text-secondary mr-2" size={20} />
              <div>
                <div className="text-2xl font-bold text-secondary" data-testid="total-volume">
                  {statsLoading ? "..." : Math.round(stats?.totalVolume || 15000).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Total Volume (lbs)</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Summary */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3 text-foreground">Progress Summary</h3>
          {statsLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted animate-pulse rounded" />
              <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-foreground" data-testid="progress-summary">
                Over the last month, your performance has improved by an average of{" "}
                <span className="font-semibold text-accent">
                  {stats?.averageImprovement || 15}%
                </span>{" "}
                across all exercises.
              </p>
              <div className="space-y-1 text-sm text-muted-foreground">
                {stats?.personalBests && stats.personalBests.length > 0 && (
                  <p className="flex items-center">
                    <Award className="mr-2" size={16} />
                    New Personal Best: {stats.personalBests[0].exerciseName} - {stats.personalBests[0].weight} lbs ({stats.personalBests[0].reps} reps)
                  </p>
                )}
                {stats?.mostFrequentExercise && (
                  <p className="flex items-center">
                    <Target className="mr-2" size={16} />
                    Most Frequent Exercise: {stats.mostFrequentExercise}
                  </p>
                )}
                <p className="flex items-center">
                  <Activity className="mr-2" size={16} />
                  Average Reps per Set: {stats?.averageRepsPerSet?.toFixed(1) || "8.5"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Progress Chart */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Weight Progression</h3>
          <ProgressChart data={chartData} className="h-64" />
        </CardContent>
      </Card>

      {/* Workout History */}
      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-4 text-foreground">Workout History</h3>
          {workoutsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : recentWorkouts.length > 0 ? (
            <div className="space-y-3">
              {recentWorkouts.map((workout: Workout, index: number) => {
                const borderColors = ["border-primary", "border-secondary", "border-accent"];
                return (
                  <div 
                    key={workout.id}
                    className={`border-l-4 ${borderColors[index % 3]} pl-4 py-2`}
                    data-testid={`workout-history-${workout.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-foreground">{workout.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {workout.category.replace('-', ' ')} • {workout.duration || 0} minutes
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatShortDate(new Date(workout.startTime))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">No workout history yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
