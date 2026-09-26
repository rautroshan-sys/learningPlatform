import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "@/components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Diagnostic from "./pages/Diagnostic";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="quiz/:conceptId" element={<Quiz />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
