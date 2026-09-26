import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, BookOpen, Coffee } from 'lucide-react';

const SUBJECT_CHAPTERS = {
  'Mathematics': Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`),
  'Physical Sciences': Array.from({ length: 13 }, (_, i) => `Chapter ${i + 1}`),
  'Accounting': Array.from({ length: 12 }, (_, i) => `Chapter ${i + 1}`),
  'Afrikaans FAL': Array.from({ length: 10 }, (_, i) => `Chapter ${i + 1}`)
};

export default function FocusPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState('30m');
  const [customMinutes, setCustomMinutes] = useState('25');
  const [timeInSeconds, setTimeInSeconds] = useState(1800);
  const [totalSeconds, setTotalSeconds] = useState(1800);
  
  const [mode, setMode] = useState('Study');
  const [subject, setSubject] = useState('Mathematics');
  const [chapter, setChapter] = useState('Chapter 1');
  
  const intervalRef = useRef(null);

  // Update chapter when subject changes
  useEffect(() => {
    setChapter(SUBJECT_CHAPTERS[subject][0]);
  }, [subject]);

  // Handle Preset Changes
  useEffect(() => {
    setIsRunning(false);
    if (selectedPreset === 'None') {
      setTimeInSeconds(0);
      setTotalSeconds(0);
    } else if (selectedPreset === '30m') {
      setTimeInSeconds(1800);
      setTotalSeconds(1800);
    } else if (selectedPreset === '60m') {
      setTimeInSeconds(3600);
      setTotalSeconds(3600);
    } else if (selectedPreset === 'Custom') {
      const mins = parseInt(customMinutes, 10) || 0;
      setTimeInSeconds(mins * 60);
      setTotalSeconds(mins * 60);
    }
  }, [selectedPreset, customMinutes]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeInSeconds((prev) => {
          if (selectedPreset === 'None') {
            return prev + 1;
          } else {
            if (prev <= 1) {
              setIsRunning(false);
              return 0;
            }
            return prev - 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, selectedPreset]);

  const handleReset = () => {
    setIsRunning(false);
    if (selectedPreset === 'None') {
      setTimeInSeconds(0);
    } else {
      setTimeInSeconds(totalSeconds);
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // SVG Progress Calculation
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  let strokeDashoffset = 0;
  
  if (selectedPreset !== 'None' && totalSeconds > 0) {
    strokeDashoffset = circumference - (timeInSeconds / totalSeconds) * circumference;
  } else if (selectedPreset === 'None') {
    strokeDashoffset = 0; // Full circle when counting up
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 bg-violet-100 rounded-xl">
            <Timer className="w-6 h-6 text-violet-700" />
          </div>
          <h1 className="text-3xl font-bold text-violet-900">Focus Timer</h1>
        </div>
        <p className="text-violet-500">Stay focused and track your study sessions</p>
      </div>

      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-8 max-w-2xl mx-auto">
        
        {/* Timer Display */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-72 h-72 flex items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 288 288">
              {/* Background Circle */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className="stroke-violet-200"
                strokeWidth="12"
                fill="none"
              />
              {/* Progress Circle */}
              <circle
                cx="144"
                cy="144"
                r={radius}
                className="stroke-violet-500 transition-all duration-1000 ease-linear"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
              />
            </svg>
            
            {/* Time Text */}
            <div className="relative flex flex-col items-center">
              <span className="text-4xl font-bold text-violet-900 tracking-wider font-mono">
                {formatTime(timeInSeconds)}
              </span>
              <div className="mt-3 bg-violet-100 text-violet-700 rounded-full px-4 py-1.5 text-sm font-medium">
                {mode}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mt-8">
            <div className="w-12" /> {/* Spacer for centering play button */}
            <button
              onClick={toggleTimer}
              className="w-16 h-16 bg-violet-600 hover:bg-violet-700 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
            >
              {isRunning ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
            </button>
            <button
              onClick={handleReset}
              className="w-12 h-12 bg-violet-100 hover:bg-violet-200 text-violet-700 rounded-full flex items-center justify-center transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurations */}
        <div className="space-y-6 pt-6 border-t border-violet-100">
          
          {/* Presets */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-violet-900">Duration</span>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {['None', '30m', '60m', 'Custom'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setSelectedPreset(preset)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedPreset === preset
                      ? 'bg-violet-600 text-white'
                      : 'bg-violet-100 text-violet-700 hover:bg-violet-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
            {selectedPreset === 'Custom' && (
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="number"
                  min="1"
                  value={customMinutes}
                  onChange={(e) => setCustomMinutes(e.target.value)}
                  className="w-20 text-center border border-violet-200 rounded-xl px-3 py-1.5 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none text-violet-900"
                />
                <span className="text-violet-500 text-sm">minutes</span>
              </div>
            )}
          </div>

          {/* Modes */}
          <div className="flex flex-col items-center gap-3">
            <span className="text-sm font-semibold text-violet-900">Session Mode</span>
            <div className="flex items-center justify-center gap-3">
              {[
                { name: 'Study', icon: BookOpen },
                { name: 'Revision', icon: RotateCcw },
                { name: 'Misc', icon: Coffee }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.name}
                    onClick={() => setMode(m.name)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      mode === m.name
                        ? 'bg-violet-600 text-white border-transparent'
                        : 'bg-white text-violet-700 border border-violet-200 hover:bg-violet-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {m.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Subject & Chapter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-violet-900 ml-1">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border border-violet-200 rounded-xl px-4 py-2.5 text-violet-900 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none bg-white appearance-none"
              >
                {Object.keys(SUBJECT_CHAPTERS).map((sub) => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-violet-900 ml-1">Chapter</label>
              <select
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                className="w-full border border-violet-200 rounded-xl px-4 py-2.5 text-violet-900 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none bg-white appearance-none"
              >
                {SUBJECT_CHAPTERS[subject].map((chap) => (
                  <option key={chap} value={chap}>{chap}</option>
                ))}
              </select>
            </div>
          </div>

        </div>
      </div>

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center">
          <div className="flex-1">
            <p className="text-sm text-violet-500 mb-1">Today's Sessions</p>
            <p className="text-2xl font-bold text-violet-900">0</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-violet-100"></div>
          <div className="flex-1">
            <p className="text-sm text-violet-500 mb-1">Total Focus Time</p>
            <p className="text-2xl font-bold text-violet-900">0h 0m</p>
          </div>
          <div className="hidden sm:block w-px h-12 bg-violet-100"></div>
          <div className="flex-1">
            <p className="text-sm text-violet-500 mb-1">Current Streak</p>
            <p className="text-2xl font-bold text-violet-900">0 days</p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
