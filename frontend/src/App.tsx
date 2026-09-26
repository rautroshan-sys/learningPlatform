import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "./components/ui/sonner";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import Diagnostic from "./pages/Diagnostic";
import Login from "./pages/Login";
import Onboarding from "./pages/Onboarding";
import Path from "./pages/Path";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import Sandbox from "./pages/Sandbox";
import Search from "./pages/Search";
import Article from "./pages/Article";
import Course from "./pages/Course";
import MainLayout from "./layouts/MainLayout";

function App() {
  return (
    <Router>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/login" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="course" element={<Course />} />
          <Route path="path" element={<Path />} />
          <Route path="progress" element={<Progress />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sandbox" element={<Sandbox />} />
          <Route path="search" element={<Search />} />
          <Route path="article/:articleId" element={<Article />} />
          <Route path="diagnostic" element={<Diagnostic />} />
          <Route path="quiz/:conceptId" element={<Quiz />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
