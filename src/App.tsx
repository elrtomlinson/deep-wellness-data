import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrainFogProvider } from "@/contexts/BrainFogContext";
import Dashboard from "./pages/Dashboard";
import TrackPage from "./pages/Track";
import ConditionsPage from "./pages/Conditions";
import ReportPage from "./pages/ReportPage";
import TimelinePage from "./pages/TimelinePage";
import JournalPage from "./pages/JournalPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrainFogProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/track" element={<TrackPage />} />
            <Route path="/conditions" element={<ConditionsPage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </BrainFogProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
