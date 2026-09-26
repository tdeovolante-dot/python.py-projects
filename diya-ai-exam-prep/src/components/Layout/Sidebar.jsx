import { NavLink } from 'react-router-dom';
import {
  GraduationCap,
  Timer,
  Sparkles,
  BookOpen,
  RotateCcw,
  CalendarDays,
  StickyNote,
  ListChecks,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/exams', icon: GraduationCap, label: 'Exams' },
  { to: '/focus', icon: Timer, label: 'Focus' },
  { to: '/diya-ai', icon: Sparkles, label: 'Diya AI' },
  { to: '/syllabus', icon: BookOpen, label: 'Syllabus' },
  { to: '/revision', icon: RotateCcw, label: 'Revision' },
  { to: '/planner', icon: CalendarDays, label: 'Planner' },
  { to: '/notes', icon: StickyNote, label: 'Notes' },
  { to: '/todo', icon: ListChecks, label: 'To-Do List' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gradient-to-b from-violet-900 via-violet-800 to-purple-900 
        flex flex-col z-50 transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-[220px]'}`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-violet-700/50">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-white font-bold text-lg leading-tight tracking-tight">Diya AI</h1>
            <p className="text-violet-300 text-[11px] font-medium">Exam Prep</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${
                isActive
                  ? 'bg-white/15 text-white shadow-lg shadow-violet-900/20'
                  : 'text-violet-300 hover:text-white hover:bg-white/10'
              }
              ${collapsed ? 'justify-center' : ''}`
            }
            title={label}
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* More / Bottom */}
      <div className="px-3 pb-3 space-y-1">
        <button
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-300 
            hover:text-white hover:bg-white/10 transition-all duration-200 w-full
            ${collapsed ? 'justify-center' : ''}`}
        >
          <MoreHorizontal className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>More</span>}
        </button>

        {/* Collapse Toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-violet-400 
            hover:text-white hover:bg-white/10 transition-all duration-200 w-full
            ${collapsed ? 'justify-center' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5 flex-shrink-0" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
