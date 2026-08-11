import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrainFogProvider } from "@/contexts/BrainFogContext";
import Dashboard from "./pages/Dashboard";

const TrackPage = lazy(() => import("./pages/Track"));
const ConditionsPage = lazy(() => import("./pages/Conditions"));
const ReportPage = lazy(() => import("./pages/ReportPage"));
const TimelinePage = lazy(() => import("./pages/TimelinePage"));
const JournalPage = lazy(() => import("./pages/JournalPage"));
const DnaReportPage = lazy(() => import("./pages/DnaReportPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]" role="status" aria-label="Loading">
    <div className="h-6 w-6 rounded-full border-2 border-muted border-t-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrainFogProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/track" element={<TrackPage />} />
              <Route path="/conditions" element={<ConditionsPage />} />
              <Route path="/report" element={<ReportPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
              <Route path="/journal" element={<JournalPage />} />
              <Route path="/dna" element={<DnaReportPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </BrainFogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
