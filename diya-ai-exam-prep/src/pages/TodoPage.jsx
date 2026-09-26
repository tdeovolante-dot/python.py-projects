import React, { useState, useEffect, useMemo } from 'react';
import { ListChecks, Search, Plus, Calendar, Trash2, Check, X, AlertCircle } from 'lucide-react';
import api from '../api/client';

export default function TodoPage() {
  const [tasks, setTasks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('All'); // All, Active, Completed
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [showModal, setShowModal] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    subject: 'Mathematics',
    dueDate: '',
    priority: 'Medium'
  });

  const subjects = ['All Subjects', 'Mathematics', 'Physical Sciences', 'Accounting', 'Afrikaans'];
  
  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get('/api/todos');
        setTasks(response.data.todos || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        // Fallback for UI if backend isn't ready
        setTasks([
          { id: 1, title: 'Complete Calculus past paper 2024', subject: 'Mathematics', dueDate: '2026-10-01', priority: 'High', completed: false },
          { id: 2, title: 'Review Organic Chemistry notes', subject: 'Physical Sciences', dueDate: '2026-10-03', priority: 'Medium', completed: false },
        ]);
      }
    };
    fetchTasks();
  }, []);

  const getSubjectColor = (subject) => {
    switch (subject) {
      case 'Mathematics': return 'bg-blue-100 text-blue-700';
      case 'Physical Sciences': return 'bg-emerald-100 text-emerald-700';
      case 'Accounting': return 'bg-amber-100 text-amber-700';
      case 'Afrikaans': return 'bg-rose-100 text-rose-700';
      default: return 'bg-violet-100 text-violet-700';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-rose-500';
      case 'Medium': return 'bg-amber-500';
      case 'Low': return 'bg-emerald-500';
      default: return 'bg-slate-500';
    }
  };

  const getDueDateStatus = (dateStr) => {
    if (!dateStr) return { color: 'text-slate-500', isOverdue: false, isToday: false };
    const today = new Date('2026-09-25T00:00:00Z');
    const dueDate = new Date(dateStr + 'T00:00:00Z');
    const todayStr = today.toISOString().split('T')[0];
    if (dateStr === todayStr) return { color: 'text-amber-500', isOverdue: false, isToday: true };
    if (dueDate < today) return { color: 'text-rose-500', isOverdue: true, isToday: false };
    return { color: 'text-slate-500', isOverdue: false, isToday: false };
  };

  const toggleTask = async (id) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    // Optimistic UI update
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    
    try {
      await api.put(`/api/todos/${id}`, { ...task, completed: !task.completed });
    } catch (error) {
      console.error('Error toggling task:', error);
      // Revert on error
      setTasks(tasks.map(t => t.id === id ? { ...t, completed: task.completed } : t));
    }
  };

  const deleteTask = async (id) => {
    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks(tasks.filter(t => t.id !== id));
    
    try {
      await api.delete(`/api/todos/${id}`);
    } catch (error) {
      console.error('Error deleting task:', error);
      // Revert on error
      setTasks(previousTasks);
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      const response = await api.post('/api/todos', { ...newTask, completed: false });
      setTasks([...tasks, response.data]);
    } catch (error) {
      console.error('Error creating task:', error);
      // Fallback for UI if backend isn't ready
      setTasks([...tasks, { ...newTask, id: Date.now(), completed: false }]);
    }
    
    setNewTask({ title: '', subject: 'Mathematics', dueDate: '', priority: 'Medium' });
    setShowModal(false);
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(t => {
        if (filter === 'Active') return !t.completed;
        if (filter === 'Completed') return t.completed;
        return true;
      })
      .filter(t => subjectFilter === 'All Subjects' || t.subject === subjectFilter)
      .filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
        const statusA = getDueDateStatus(a.dueDate);
        const statusB = getDueDateStatus(b.dueDate);
        if (statusA.isOverdue && !statusB.isOverdue) return -1;
        if (!statusA.isOverdue && statusB.isOverdue) return 1;
        
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
  }, [tasks, filter, subjectFilter, searchQuery]);

  const activeCount = tasks.filter(t => !t.completed).length;
  const completedCount = tasks.filter(t => t.completed).length;
  const overdueCount = tasks.filter(t => !t.completed && getDueDateStatus(t.dueDate).isOverdue).length;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-violet-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
          <ListChecks className="w-8 h-8 text-violet-600" />
          To-Do List
        </h1>
        <p className="text-violet-500 mt-2">Manage your study tasks and deadlines</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
          />
        </div>
        
        <div className="flex bg-white rounded-xl border border-violet-200 p-1">
          {['All', 'Active', 'Completed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-violet-100 text-violet-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300"
        >
          <Plus className="w-5 h-5" />
          Add Task
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {subjects.map(s => (
          <button
            key={s}
            onClick={() => setSubjectFilter(s)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${subjectFilter === s ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 border border-violet-200 hover:bg-violet-50'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3 mb-8">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-violet-100 shadow-sm">
            <ListChecks className="w-12 h-12 text-violet-200 mx-auto mb-3" />
            <p className="text-slate-500">No tasks found matching your criteria.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const dateStatus = getDueDateStatus(task.dueDate);
            return (
              <div key={task.id} className="group bg-white rounded-2xl border border-violet-100 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-all duration-300">
                <button
                  onClick={() => toggleTask(task.id)}
                  className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center shrink-0 transition-colors ${task.completed ? 'bg-violet-600 border-violet-600' : 'border-violet-300 hover:border-violet-400'}`}
                >
                  {task.completed && <Check className="w-4 h-4 text-white" />}
                </button>
                
                <div className="flex-1 min-w-0 flex items-center gap-3">
                  <span className={`font-medium truncate ${task.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                  <div className={`w-2 h-2 rounded-full shrink-0 ${getPriorityColor(task.priority)}`} title={`${task.priority} Priority`} />
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium hidden md:inline-block ${getSubjectColor(task.subject)}`}>
                    {task.subject}
                  </span>
                  
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 text-sm font-medium ${dateStatus.color}`}>
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                  )}

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="flex gap-6 text-sm text-slate-500 font-medium pb-8">
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-400"></span> {activeCount} active tasks</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-400"></span> {completedCount} completed</span>
        <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-400"></span> {overdueCount} overdue</span>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-violet-100 flex justify-between items-center bg-violet-50">
              <h2 className="text-xl font-bold text-violet-900">New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-violet-400 hover:text-violet-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none"
                  placeholder="What needs to be done?"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={newTask.subject}
                  onChange={e => setNewTask({ ...newTask, subject: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none bg-white"
                >
                  {subjects.filter(s => s !== 'All Subjects').map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Priority</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High'].map(p => (
                    <button
                      key={p}
                      onClick={() => setNewTask({ ...newTask, priority: p })}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors border ${newTask.priority === p ? 'bg-violet-100 border-violet-300 text-violet-700' : 'bg-white border-violet-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateTask}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium"
              >
                Create Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
