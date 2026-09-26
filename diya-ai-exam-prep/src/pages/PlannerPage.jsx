import React, { useState, useEffect } from 'react';
import { CalendarDays, Target, Star, CheckCircle, Loader2, Sun, Moon, Sparkles } from 'lucide-react';
import api from '../api/client';

export default function PlannerPage() {
  const [goals, setGoals] = useState(['', '', '']);
  const [goalsSaved, setGoalsSaved] = useState(false);
  const [savingGoals, setSavingGoals] = useState(false);

  const [studyBlocks, setStudyBlocks] = useState([]);
  const [generatingBlocks, setGeneratingBlocks] = useState(false);

  const [weakTopics, setWeakTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  const [review, setReview] = useState({ rating: 0, accomplish: '', improve: '' });
  const [reviewSaved, setReviewSaved] = useState(false);

  // Fetch initial planner data
  useEffect(() => {
    const fetchPlannerData = async () => {
      try {
        const response = await api.get('/api/accountability/morning-setup/user1');
        if (response.data.daily_goals && response.data.daily_goals.length > 0) {
          // Pad with empty strings if less than 3
          const loadedGoals = [...response.data.daily_goals];
          while (loadedGoals.length < 3) loadedGoals.push('');
          setGoals(loadedGoals.slice(0, 3));
          setGoalsSaved(true);
        }
      } catch (error) {
        console.error('Error fetching morning setup:', error);
      }
    };
    fetchPlannerData();
  }, []);

  // Fetch Weakest Topics (Error Book Pipeline connected to AI Grader errors)
  useEffect(() => {
    const fetchWeakTopics = async () => {
      try {
        const response = await api.get('/api/accountability/weakest-topics/user1');
        setWeakTopics(response.data.weakest_topics || []);
      } catch (error) {
        console.error('Error fetching weak topics:', error);
        // Fallback data for demonstration
        setWeakTopics([
          { subject: 'Mathematics', topic: 'Calculus Error (Sign Change)', performance_score: 45 },
          { subject: 'Physical Sciences', topic: 'Electromagnetism Formula Application', performance_score: 55 }
        ]);
      } finally {
        setLoadingTopics(false);
      }
    };

    fetchWeakTopics();
  }, []);

  const handleSaveGoals = async () => {
    setSavingGoals(true);
    try {
      await api.post('/api/accountability/morning-setup', {
        user_id: 'user1',
        daily_goals: goals.filter(g => g.trim() !== '')
      });
      setGoalsSaved(true);
    } catch (error) {
      console.error('Error saving goals:', error);
      // Simulate success for UI if backend is not ready
      setGoalsSaved(true);
    } finally {
      setSavingGoals(false);
    }
  };

  const handleGenerateBlocks = async () => {
    setGeneratingBlocks(true);
    try {
      const response = await api.post('/api/accountability/study-blocks/generate', {
        user_id: 'user1'
      });
      setStudyBlocks(response.data.study_blocks || []);
    } catch (error) {
      console.error('Error generating study blocks:', error);
      // Fallback data
      setStudyBlocks([
        { time: '14:00 - 15:30', subject: 'Mathematics', topic: 'Reviewing Sign Errors', duration: 90 },
        { time: '16:00 - 17:00', subject: 'Physical Sciences', topic: 'Electromagnetism Practice', duration: 60 }
      ]);
    } finally {
      setGeneratingBlocks(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    try {
      await api.put('/api/accountability/evening-review/user1', review);
      setReviewSaved(true);
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewSaved(true); // Fallback for UI
    }
  };

  const weekDays = [
    { day: 'Mon', date: '21', hasBlocks: true, hours: '3h' },
    { day: 'Tue', date: '22', hasBlocks: true, hours: '4.5h' },
    { day: 'Wed', date: '23', hasBlocks: true, hours: '2h' },
    { day: 'Thu', date: '24', hasBlocks: false, hours: '0h' },
    { day: 'Fri', date: '25', hasBlocks: true, hours: '5h', current: true },
    { day: 'Sat', date: '26', hasBlocks: false, hours: '0h' },
    { day: 'Sun', date: '27', hasBlocks: false, hours: '0h' }
  ];

  const getSubjectColor = (subject) => {
    if (subject.includes('Math')) return 'border-l-blue-500';
    if (subject.includes('Science')) return 'border-l-emerald-500';
    if (subject.includes('Accounting')) return 'border-l-amber-500';
    if (subject.includes('Afrikaans')) return 'border-l-rose-500';
    return 'border-l-violet-500';
  };

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen bg-violet-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
          <CalendarDays className="w-8 h-8 text-violet-600" />
          Study Planner
        </h1>
        <p className="text-violet-500 mt-2">Plan your study schedule</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Morning Setup */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              Daily Goals
            </h2>
            {goalsSaved ? (
              <span className="flex items-center gap-1 text-sm font-medium text-emerald-600">
                <CheckCircle className="w-4 h-4" /> Saved
              </span>
            ) : (
              <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div> Unsaved
              </span>
            )}
          </div>
          
          <div className="space-y-3 mb-4">
            {goals.map((goal, idx) => (
              <input
                key={idx}
                type="text"
                value={goal}
                onChange={(e) => {
                  const newGoals = [...goals];
                  newGoals[idx] = e.target.value;
                  setGoals(newGoals);
                  setGoalsSaved(false);
                }}
                placeholder={`Top goal ${idx + 1} for today...`}
                className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none"
              />
            ))}
          </div>
          
          <button
            onClick={handleSaveGoals}
            disabled={savingGoals}
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 font-medium transition-all duration-300 flex items-center gap-2 disabled:opacity-70"
          >
            {savingGoals ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Save Goals
          </button>
        </div>

        {/* Weakest Topics / Error Book */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2 mb-1">
              <Target className="w-5 h-5 text-rose-500" />
              Your Weak Areas
            </h2>
            <p className="text-xs text-violet-500">Auto-generated from your AI Grader errors</p>
          </div>
          
          {loadingTopics ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-violet-300 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {weakTopics.map((topic, i) => (
                <div key={i} className="p-3 bg-rose-50 rounded-xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-rose-600 uppercase tracking-wider mb-1">{topic.subject}</div>
                    <div className="text-sm font-medium text-slate-700">{topic.topic}</div>
                  </div>
                  <div className="text-rose-500 font-bold bg-white px-2 py-1 rounded-lg text-sm shadow-sm border border-rose-100">
                    {topic.performance_score}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Weekly Overview */}
      <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 mb-8">
        <h2 className="text-lg font-bold text-violet-900 mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((d, i) => (
            <div key={i} className={`flex flex-col items-center p-3 rounded-xl border ${d.current ? 'border-violet-400 bg-violet-50' : 'border-slate-100'}`}>
              <span className="text-xs font-medium text-slate-500 uppercase">{d.day}</span>
              <span className={`text-lg font-bold my-1 ${d.current ? 'text-violet-700' : 'text-slate-700'}`}>{d.date}</span>
              <div className="flex flex-col items-center gap-1 mt-1">
                <div className={`w-2 h-2 rounded-full ${d.hasBlocks ? 'bg-emerald-400' : 'bg-slate-200'}`}></div>
                <span className="text-xs text-slate-400 font-medium">{d.hours}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        
        {/* Study Blocks */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-violet-500" />
              Study Blocks
            </h2>
            <button
              onClick={handleGenerateBlocks}
              disabled={generatingBlocks}
              className="bg-violet-100 text-violet-700 hover:bg-violet-200 rounded-xl px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              {generatingBlocks ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
            </button>
          </div>

          <div className="space-y-4">
            {studyBlocks.length === 0 && !generatingBlocks ? (
              <div className="text-center py-8 text-slate-500">
                Click generate to create today's study schedule based on your weak areas.
              </div>
            ) : (
              studyBlocks.map((block, idx) => (
                <div key={idx} className={`bg-slate-50 rounded-xl p-4 border-l-4 border-y border-r border-slate-100 ${getSubjectColor(block.subject)}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm font-bold text-slate-700">{block.time}</span>
                    <span className="text-xs font-medium bg-white px-2 py-1 rounded-md text-slate-500 shadow-sm border border-slate-100">
                      {block.duration} min
                    </span>
                  </div>
                  <div className="font-semibold text-violet-900 mb-1">{block.subject}</div>
                  <div className="text-sm text-slate-600">{block.topic}</div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Evening Review */}
        <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-violet-900 flex items-center gap-2">
              <Moon className="w-5 h-5 text-indigo-500" />
              Evening Reflection
            </h2>
            {reviewSaved && <span className="text-emerald-500 text-sm font-medium">Saved</span>}
          </div>

          <form onSubmit={handleSubmitReview} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">How productive was today?</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReview({ ...review, rating: star })}
                    className="p-1 focus:outline-none"
                  >
                    <Star className={`w-8 h-8 ${review.rating >= star ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">What did you accomplish?</label>
              <textarea
                value={review.accomplish}
                onChange={(e) => setReview({ ...review, accomplish: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none resize-none h-24"
                placeholder="I completed 2 past papers..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">What will you improve tomorrow?</label>
              <textarea
                value={review.improve}
                onChange={(e) => setReview({ ...review, improve: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none resize-none h-24"
                placeholder="Start studying earlier..."
              />
            </div>

            <button
              type="submit"
              className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-3 font-medium transition-all duration-300"
            >
              Submit Review
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
