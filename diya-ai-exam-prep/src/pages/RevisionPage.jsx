import React, { useState, useEffect } from 'react';
import { RotateCcw, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
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

const getStatusColor = (val) => {
  if (val === 0) return 'text-rose-500';
  if (val < 50) return 'text-amber-500';
  if (val < 100) return 'text-blue-500';
  return 'text-emerald-500';
};

export default function RevisionPage() {
  const [progress, setProgress] = useState({});
  const [confidence, setConfidence] = useState({});
  const [expanded, setExpanded] = useState({});

  // Fetch initial state from DB
  useEffect(() => {
    const fetchRevisionData = async () => {
      try {
        const response = await api.get('/api/revision');
        setProgress(response.data.progress || {});
        setConfidence(response.data.confidence || {});
      } catch (error) {
        console.error('Error fetching revision data:', error);
      }
    };
    fetchRevisionData();
  }, []);

  const handleProgressChange = (subjectId, chapterIdx, val) => {
    setProgress(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [chapterIdx]: parseInt(val)
      }
    }));
  };

  const handleConfidenceChange = (subjectId, chapterIdx, level) => {
    setConfidence(prev => ({
      ...prev,
      [subjectId]: {
        ...(prev[subjectId] || {}),
        [chapterIdx]: level
      }
    }));
  };

  // Sync changes to DB on blur or explicit change (debounced effectively by capturing it)
  const syncUpdateToDB = async (subjectId, chapterIdx) => {
    try {
      await api.put(`/api/revision/${subjectId}/${chapterIdx}`, {
        progress: progress[subjectId]?.[chapterIdx] || 0,
        confidence: confidence[subjectId]?.[chapterIdx] || null
      });
    } catch (error) {
      console.error('Error syncing revision data:', error);
    }
  };

  const toggleExpand = (subjectId) => {
    setExpanded(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  };

  const getSubjectStats = (subject) => {
    let totalProgress = 0;
    const total = subject.chapters.length;
    
    if (total === 0) return { avgProgress: 0 };
    
    for (let i = 0; i < total; i++) {
      totalProgress += (progress[subject.id]?.[i] || 0);
    }
    
    const avgProgress = Math.round(totalProgress / total);
    return { avgProgress };
  };

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen bg-violet-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3 mb-2">
          <RotateCcw className="w-8 h-8 text-violet-600" />
          Revision Tracker
        </h1>
        <p className="text-violet-500 text-lg">Track your revision progress for each topic</p>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-violet-900 mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5" />
          Overall Revision
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {subjectsData.map(subject => {
            const { avgProgress } = getSubjectStats(subject);
            const radius = 28;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (avgProgress / 100) * circumference;

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
                    <span className="text-sm font-bold text-slate-700">{avgProgress}%</span>
                  </div>
                </div>
                <p className="text-sm text-slate-500">Average Progress</p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-6">
        {subjectsData.map(subject => {
          const { avgProgress } = getSubjectStats(subject);
          const isExpanded = expanded[subject.id];

          return (
            <div key={subject.id} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-4 cursor-pointer" onClick={() => toggleExpand(subject.id)}>
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${colorMaps[subject.color].dot}`}></div>
                  <h2 className="text-xl font-bold text-violet-900">{subject.name}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-500">{avgProgress}%</span>
                  {isExpanded ? <ChevronUp className="text-slate-400" /> : <ChevronDown className="text-slate-400" />}
                </div>
              </div>
              
              <div className="w-full h-2 rounded-full bg-violet-100 mb-2">
                <div className={`h-full rounded-full ${colorMaps[subject.color].fill} transition-all duration-500`} style={{ width: `${avgProgress}%` }}></div>
              </div>

              {isExpanded && (
                <div className="mt-6 space-y-4">
                  {subject.chapters.map((chapter, idx) => {
                    const currentProgress = progress[subject.id]?.[idx] || 0;
                    const currentConf = confidence[subject.id]?.[idx] || null;

                    return (
                      <div key={idx} className="flex flex-col md:flex-row md:items-center justify-between p-4 bg-slate-50 rounded-xl gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-slate-500 font-medium mb-1">Chapter {idx + 1}</p>
                          <p className="font-semibold text-slate-800 mb-2">{chapter}</p>
                          <div className="flex items-center gap-3">
                            <input 
                              type="range" 
                              min="0" max="100" 
                              value={currentProgress} 
                              onChange={(e) => handleProgressChange(subject.id, idx, e.target.value)}
                              onMouseUp={() => syncUpdateToDB(subject.id, idx)}
                              onTouchEnd={() => syncUpdateToDB(subject.id, idx)}
                              className="w-full md:w-48 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
                            />
                            <span className={`text-sm font-bold w-12 ${getStatusColor(currentProgress)}`}>{currentProgress}%</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col gap-2 min-w-[200px]">
                          <p className="text-xs text-slate-500 font-medium">Confidence Level</p>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                handleConfidenceChange(subject.id, idx, 'Low');
                                setTimeout(() => syncUpdateToDB(subject.id, idx), 0);
                              }}
                              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${currentConf === 'Low' ? 'bg-rose-100 text-rose-700 border-rose-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                              Low
                            </button>
                            <button 
                              onClick={() => {
                                handleConfidenceChange(subject.id, idx, 'Medium');
                                setTimeout(() => syncUpdateToDB(subject.id, idx), 0);
                              }}
                              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${currentConf === 'Medium' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                              Medium
                            </button>
                            <button 
                              onClick={() => {
                                handleConfidenceChange(subject.id, idx, 'High');
                                setTimeout(() => syncUpdateToDB(subject.id, idx), 0);
                              }}
                              className={`px-3 py-1 rounded-md text-xs font-semibold border transition-colors ${currentConf === 'High' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                            >
                              High
                            </button>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">Last revised: Not yet</p>
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
