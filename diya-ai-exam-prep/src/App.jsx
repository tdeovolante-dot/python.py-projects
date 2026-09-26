import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/Layout/MainLayout';
import DashboardPage from './pages/DashboardPage';
import FocusPage from './pages/FocusPage';
import AIGradingPage from './pages/AIGradingPage';
import SyllabusPage from './pages/SyllabusPage';
import RevisionPage from './pages/RevisionPage';
import PlannerPage from './pages/PlannerPage';
import NotesPage from './pages/NotesPage';
import TodoPage from './pages/TodoPage';

export default function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/exams" replace />} />
        <Route path="/exams" element={<DashboardPage />} />
        <Route path="/focus" element={<FocusPage />} />
        <Route path="/diya-ai" element={<AIGradingPage />} />
        <Route path="/syllabus" element={<SyllabusPage />} />
        <Route path="/revision" element={<RevisionPage />} />
        <Route path="/planner" element={<PlannerPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/todo" element={<TodoPage />} />
      </Routes>
    </MainLayout>
  );
}
