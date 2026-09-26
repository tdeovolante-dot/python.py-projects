import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronDown, ChevronUp, CheckCircle2, Circle, BarChart3 } from 'lucide-react';
import api from '../api/client';

const subjectsData = [
  {
    id: 'math',
    name: 'Mathematics',
    color: 'blue',
    chapters: ['Algebra & Equations', 'Number Patterns', 'Functions & Graphs', 'Finance', 'Probability', 'Statistics', 'Analytical Geometry', 'Trigonometry', 'Euclidean Geometry', 'Calculus']
  },
  {
    id: 'physics',
    name: 'Physical Sciences',
    color: 'emerald',
    chapters: ["Newton's Laws", 'Momentum & Impulse', 'Vertical Projectile Motion', 'Organic Chemistry', 'Work Energy & Power', 'Electrostatics', 'Electric Circuits', 'Electrodynamics', 'Photoelectric Effect', 'Emission Spectra', 'Chemical Equilibrium', 'Acids & Bases', 'Electrochemistry']
  },
  {
    id: 'accounting',
    name: 'Accounting',
    color: 'amber',
    chapters: ['Companies', 'Fixed Assets', 'Inventory Valuation', 'VAT', 'Manufacturing', 'Cost Accounting', 'Cash Flow Statement', 'Financial Statements', 'Ratio Analysis', 'Budgeting', 'Ethics', 'Partnerships']
  },
  {
    id: 'afrikaans',
    name: 'Afrikaans FAL',
    color: 'purple',
    chapters: ['Begrip', 'Taal', 'Letterkunde', 'Skryfwerk', 'Mondeling', 'Opsomming', 'Visuele Geletterdheid', 'Advertensies', 'Kartoon', 'Prosa']
  }
];

const colorMaps = {
  blue: { stroke: 'stroke-blue-500', fill: 'bg-blue-500', dot: 'bg-blue-500' },
  emerald: { stroke: 'stroke-emerald-500', fill: 'bg-emerald-500', dot: 'bg-emerald-500' },
  amber: { stroke: 'stroke-amber-500', fill: 'bg-amber-500', dot: 'bg-amber-500' },
  purple: { stroke: 'stroke-purple-500', fill: 'bg-purple-500', dot: 'bg-purple-500' },
};

export default function SyllabusPage() {
  const [completion, setCompletion] = useState({});
  const [expanded, setExpanded] = useState({});

  // Fetch initial state from DB
  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const response = await api.get('/api/syllabus');
        setCompletion(response.data.completion || {});
      } catch (error) {
        console.error('Error fetching syllabus data:', error);
      }
    };
    fetchSyllabus();
  }, []);

  const toggleChapter = async (subjectId, chapterIdx) => {
    const isCompleted = !completion[subjectId]?.[chapterIdx];
    
    // Optimistic UI update
    setCompletion(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [chapterIdx]: isCompleted
      }
    }));

    // Update database
    try {
      await api.put(`/api/syllabus/${subjectId}/${chapterIdx}`, {
        completed: isCompleted
      });
    } catch (error) {
      console.error('Error updating chapter:', error);
      // Revert on error
      setCompletion(prev => ({
        ...prev,
        [subjectId]: {
          ...(prev[subjectId] || {}),
          [chapterIdx]: !isCompleted
        }
      }));
    }
  };

  const toggleExpand = (subjectId) => {
    setExpanded(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const getSubjectStats = (subject) => {
    const completedChapters = subject.chapters.reduce((acc, _, idx) => {
      return acc + (completion[subject.id]?.[idx] ? 1 : 0);
    }, 0);
    const total = subject.chapters.length;
    const percentage = total === 0 ? 0 : Math.round((completedChapters / total) * 100);
    return { completedChapters, total, percentage };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-violet-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3 mb-2">
          <BookOpen className="w-8 h-8 text-violet-600" />
          Syllabus Tracker
        </h1>
        <p className="text-violet-500 text-lg">Track your progress through the IEB syllabus</p>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-violet-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Overall Progress
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjectsData.map(subject => {
            const { completedChapters, total, percentage } = getSubjectStats(subject);
            const radius = 28;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (percentage / 100) * circumference;

            return (
              <div key={subject.id} className="flex flex-col items-center p-4 bg-slate-50 rounded-xl">
                <h3 className="font-semibold text-slate-700 mb-4">{subject.name}</h3>
                <div className="relative w-16 h-16 mb-4">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-200" />
                    <circle 
                      cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" 
                      strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                      className={`${colorMaps[subject.color].stroke} transition-all duration-1000`} 
                    />
                  </svg>
                  <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                    <span className="text-sm font-bold text-slate-700">{percentage}%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">{completedChapters}/{total} chapters</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {subjectsData.map(subject => {
          const { completedChapters, total, percentage } = getSubjectStats(subject);
          const isExpanded = expanded[subject.id];

          return (
            <div key={subject.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleExpand(subject.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colorMaps[subject.color].dot}`}></div>
                  <h2 className="text-xl font-bold text-violet-900">{subject.name}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-500">{percentage}%</span>
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>
              
              <div className="w-full h-2 rounded-full bg-violet-100 mb-2">
                <div className={`h-full rounded-full ${colorMaps[subject.color].fill} transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
              </div>

              {isExpanded && (
                <div className="mt-6 space-y-3">
                  {subject.chapters.map((chapter, idx) => {
                    const isComplete = completion[subject.id]?.[idx];
                    return (
                      <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer" onClick={() => toggleChapter(subject.id, idx)}>
                        <div className="flex items-center gap-4">
                          <button className="focus:outline-none">
                            {isComplete ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <Circle className="w-6 h-6 text-slate-300" />}
                          </button>
                          <div>
                            <p className="text-sm text-slate-500 font-medium">Chapter {idx + 1}</p>
                            <p className={`font-semibold ${isComplete ? 'text-slate-500 line-through' : 'text-slate-800'}`}>{chapter}</p>
                          </div>
                        </div>
                        <div>
                          {isComplete ? (
                            <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">Complete</span>
                          ) : (
                            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-sm font-medium">Not Started</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
