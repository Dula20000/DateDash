import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Workout from "@/pages/workout";
import Progress from "@/pages/progress";
import Navigation from "@/components/navigation";

function Router() {
  return (
    <div className="max-w-md mx-auto bg-card min-h-screen relative">
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/workout" component={Workout} />
        <Route path="/progress" component={Progress} />
        <Route component={NotFound} />
      </Switch>
      <Navigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
