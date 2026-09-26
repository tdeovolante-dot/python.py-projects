import React, { useState, useEffect, useRef } from 'react';
import { Pin, Clock, AlertCircle, GraduationCap, FlaskConical, Calculator, Calendar, FileUp, Download, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client';

export default function DashboardPage() {
  const navigate = useNavigate();
  const targetDate = new Date('2026-10-20T09:00:00');
  
  const calculateTimeLeft = (target) => {
    const difference = target - new Date();
    if (difference > 0) {
      return {
        Days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        Hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        Minutes: Math.floor((difference / 1000 / 60) % 60),
        Seconds: Math.floor((difference / 1000) % 60)
      };
    }
    return { Days: 0, Hours: 0, Minutes: 0, Seconds: 0 };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(targetDate));

  // Past Papers State
  const [activeSubject, setActiveSubject] = useState('Mathematics');
  const [papers, setPapers] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const subjects = ['Mathematics', 'Physical Sciences', 'Accounting', 'Afrikaans FAL'];

  // Fetch past papers
  useEffect(() => {
    const fetchPapers = async () => {
      try {
        const response = await api.get(`/api/papers/?subject=${encodeURIComponent(activeSubject)}`);
        setPapers(response.data.papers || []);
      } catch (error) {
        console.error('Error fetching papers:', error);
        // Fallback for dev without backend
        setPapers([
          { id: 1, title: '2025 IEB Paper 1', date: '2025-11-01' },
          { id: 2, title: '2025 IEB Paper 2', date: '2025-11-05' }
        ]);
      }
    };
    fetchPapers();
  }, [activeSubject]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const calculateDaysLeft = (dateString) => {
    const target = new Date(dateString);
    const now = new Date();
    const diffTime = target - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const renderBadge = (daysLeft) => {
    if (daysLeft < 0) {
      return <span className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-sm font-medium">Passed</span>;
    }
    return <span className="bg-violet-100 text-violet-700 rounded-full px-3 py-1 text-sm font-medium">{daysLeft} days left</span>;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('subject', activeSubject);
      await api.post('/api/papers/upload', formData);
      
      // Refresh papers list
      const response = await api.get(`/api/papers/?subject=${encodeURIComponent(activeSubject)}`);
      setPapers(response.data.papers || []);
    } catch (error) {
      console.error('Error uploading paper:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const academicExams = [
    { title: 'Mathematics', date: '2026-11-05T00:00:00', label: 'Nov 5, 2026', icon: Calculator, color: 'border-blue-500' },
    { title: 'Physical Sciences', date: '2026-11-12T00:00:00', label: 'Nov 12, 2026', icon: FlaskConical, color: 'border-emerald-500' },
    { title: 'Accounting', date: '2026-11-19T00:00:00', label: 'Nov 19, 2026', icon: Calendar, color: 'border-amber-500' }
  ];

  const generalCountdowns = [
    { title: 'Trial Exams Start', date: '2026-06-15T00:00:00', label: 'Jun 15, 2026' },
    { title: 'Prelim Results', date: '2026-08-01T00:00:00', label: 'Aug 1, 2026' },
    { title: 'Final Matric Exams', date: '2026-10-20T00:00:00', label: 'Oct 20, 2026' }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* 1. Hero Pinned Countdown Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-2xl shadow-sm p-8 text-white relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2 text-violet-100">
              <Pin className="w-5 h-5" />
              <span className="font-medium text-sm tracking-wide uppercase">Next Exam</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-2">Afrikaans P1 FAL</h1>
            <p className="text-violet-100 text-lg">Tuesday, October 20, 2026, 09:00 AM</p>
          </div>

          <div className="flex gap-3">
            {Object.entries(timeLeft).map(([unit, value]) => (
              <div key={unit} className="bg-white/10 rounded-xl p-4 min-w-[80px] flex flex-col items-center justify-center backdrop-blur-sm border border-white/20">
                <span className="text-3xl font-bold">{value}</span>
                <span className="text-xs text-violet-100 mt-1 uppercase tracking-wider">{unit}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Pending Tasks Banner */}
      <div className="bg-amber-50 rounded-2xl border border-amber-200 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-amber-700">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">You have 5 pending tasks</span>
        </div>
        <button 
          onClick={() => navigate('/todo')}
          className="text-amber-700 font-semibold hover:text-amber-800 transition-colors"
        >
          View Tasks →
        </button>
      </div>

      {/* 3. Two-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2 mb-4">
            <GraduationCap className="w-6 h-6 text-violet-600" />
            Academic Exams
          </h2>
          {academicExams.map((exam, i) => {
            const daysLeft = calculateDaysLeft(exam.date);
            const Icon = exam.icon;
            return (
              <div key={i} className={`bg-white rounded-2xl border border-violet-100 shadow-sm p-6 border-l-4 ${exam.color} flex items-center justify-between transition-all duration-300 hover:shadow-md`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-slate-50 text-slate-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-violet-900">{exam.title}</h3>
                    <p className="text-sm text-slate-500">{exam.label}</p>
                  </div>
                </div>
                <div>
                  {renderBadge(daysLeft)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2 mb-4">
            <Clock className="w-6 h-6 text-violet-600" />
            General Countdowns
          </h2>
          {generalCountdowns.map((item, i) => {
            const daysLeft = calculateDaysLeft(item.date);
            return (
              <div key={i} className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 flex items-center justify-between transition-all duration-300 hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-violet-50 text-violet-600">
                    <Pin className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-violet-900">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.label}</p>
                  </div>
                </div>
                <div>
                  {renderBadge(daysLeft)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Past Papers Section */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden mt-8">
        <div className="p-6 border-b border-violet-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-violet-600" />
            Past Papers Library
          </h2>
          <div className="flex items-center gap-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".pdf,.doc,.docx"
              onChange={handleFileUpload} 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="bg-violet-100 hover:bg-violet-200 text-violet-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <FileUp className="w-4 h-4" />
              {isUploading ? 'Uploading...' : 'Upload Paper'}
            </button>
          </div>
        </div>

        <div className="flex border-b border-violet-100 overflow-x-auto">
          {subjects.map(sub => (
            <button
              key={sub}
              onClick={() => setActiveSubject(sub)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${activeSubject === sub ? 'border-violet-600 text-violet-900 bg-violet-50/50' : 'border-transparent text-slate-500 hover:text-violet-700 hover:bg-slate-50'}`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="p-6">
          {papers.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No past papers found for {activeSubject}. Click 'Upload Paper' to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {papers.map((paper) => (
                <div key={paper.id} className="p-4 rounded-xl border border-violet-100 hover:border-violet-300 hover:shadow-md transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-violet-50 text-violet-600 rounded-lg shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-violet-900 truncate">{paper.title}</p>
                      <p className="text-xs text-slate-500">{paper.date || 'No date'}</p>
                    </div>
                  </div>
                  <button className="text-slate-400 hover:text-violet-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
