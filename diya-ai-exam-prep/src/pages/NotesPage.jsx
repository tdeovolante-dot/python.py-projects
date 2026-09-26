import React, { useState, useEffect, useMemo } from 'react';
import { StickyNote, Search, Plus, Edit3, Trash2, Calendar, X } from 'lucide-react';
import api from '../api/client';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All Subjects');
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);

  const [newNote, setNewNote] = useState({
    title: '',
    subject: 'Mathematics',
    content: ''
  });

  const subjects = ['All Subjects', 'Mathematics', 'Physical Sciences', 'Accounting', 'Afrikaans'];
  
  // Fetch notes on mount
  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const response = await api.get('/api/notes');
        setNotes(response.data.notes || []);
      } catch (error) {
        console.error('Error fetching notes:', error);
        // Fallback for UI if backend isn't ready
        setNotes([
          { id: 1, title: 'Calculus Derivatives Rules', subject: 'Mathematics', content: 'Power rule, chain rule, product rule. Remember that the derivative of a sum is the sum of the derivatives.', date: '2026-09-20' },
          { id: 2, title: 'Newton\'s Laws Summary', subject: 'Physical Sciences', content: 'First law: An object at rest stays at rest. Second law: F=ma. Third law: For every action, there is an equal and opposite reaction.', date: '2026-09-22' }
        ]);
      }
    };
    fetchNotes();
  }, []);

  const getSubjectStyle = (subject) => {
    switch (subject) {
      case 'Mathematics': return { pill: 'bg-blue-100 text-blue-700', border: 'border-blue-400' };
      case 'Physical Sciences': return { pill: 'bg-emerald-100 text-emerald-700', border: 'border-emerald-400' };
      case 'Accounting': return { pill: 'bg-amber-100 text-amber-700', border: 'border-amber-400' };
      case 'Afrikaans': return { pill: 'bg-rose-100 text-rose-700', border: 'border-rose-400' };
      default: return { pill: 'bg-violet-100 text-violet-700', border: 'border-violet-400' };
    }
  };

  const deleteNote = async (id) => {
    const previousNotes = [...notes];
    setNotes(notes.filter(n => n.id !== id));
    try {
      await api.delete(`/api/notes/${id}`);
    } catch (error) {
      console.error('Error deleting note:', error);
      setNotes(previousNotes);
    }
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, subject: note.subject, content: note.content });
    setShowModal(true);
  };

  const handleSaveNote = async () => {
    if (!newNote.title.trim() || !newNote.content.trim()) return;
    
    try {
      if (editingNote) {
        const response = await api.put(`/api/notes/${editingNote.id}`, newNote);
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...response.data } : n));
      } else {
        const response = await api.post('/api/notes', newNote);
        setNotes([...notes, response.data]);
      }
    } catch (error) {
      console.error('Error saving note:', error);
      // Fallback for UI testing
      if (editingNote) {
        setNotes(notes.map(n => n.id === editingNote.id ? { ...n, ...newNote } : n));
      } else {
        setNotes([...notes, { ...newNote, id: Date.now(), date: new Date().toISOString().split('T')[0] }]);
      }
    }
    
    setNewNote({ title: '', subject: 'Mathematics', content: '' });
    setEditingNote(null);
    setShowModal(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingNote(null);
    setNewNote({ title: '', subject: 'Mathematics', content: '' });
  };

  const filteredNotes = useMemo(() => {
    return notes
      .filter(n => subjectFilter === 'All Subjects' || n.subject === subjectFilter)
      .filter(n => n.title.toLowerCase().includes(searchQuery.toLowerCase()) || n.content.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [notes, subjectFilter, searchQuery]);

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-violet-50">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-violet-900 flex items-center gap-3">
          <StickyNote className="w-8 h-8 text-violet-600" />
          Notes
        </h1>
        <p className="text-violet-500 mt-2">Organize your study notes by subject</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-violet-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none"
          />
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-4 py-2 flex items-center gap-2 font-medium transition-all duration-300 shrink-0"
        >
          <Plus className="w-5 h-5" />
          New Note
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-violet-100 shadow-sm">
            <StickyNote className="w-12 h-12 text-violet-200 mx-auto mb-3" />
            <p className="text-slate-500">No notes found.</p>
          </div>
        ) : (
          filteredNotes.map(note => {
            const style = getSubjectStyle(note.subject);
            return (
              <div key={note.id} className={`bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col border-t-4 ${style.border}`}>
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${style.pill}`}>
                      {note.subject}
                    </span>
                  </div>
                  <h3 className="font-semibold text-violet-900 text-lg mb-2">{note.title}</h3>
                  <p className="text-slate-500 text-sm line-clamp-2">{note.content}</p>
                </div>
                
                <div className="px-6 py-4 bg-slate-50/50 border-t border-violet-50 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{note.date || 'Today'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditNote(note)}
                      className="p-1.5 text-slate-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-violet-100 flex justify-between items-center bg-violet-50 shrink-0">
              <h2 className="text-xl font-bold text-violet-900">{editingNote ? 'Edit Note' : 'New Note'}</h2>
              <button onClick={handleCloseModal} className="text-violet-400 hover:text-violet-700">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={newNote.title}
                    onChange={e => setNewNote({ ...newNote, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none"
                    placeholder="Note title"
                    autoFocus
                  />
                </div>
                <div className="md:w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Subject</label>
                  <select
                    value={newNote.subject}
                    onChange={e => setNewNote({ ...newNote, subject: e.target.value })}
                    className="w-full px-4 py-2 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none bg-white"
                  >
                    {subjects.filter(s => s !== 'All Subjects').map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Content</label>
                <textarea
                  value={newNote.content}
                  onChange={e => setNewNote({ ...newNote, content: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 outline-none min-h-[250px] resize-y"
                  placeholder="Start typing your notes here..."
                />
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3 rounded-b-2xl shrink-0 border-t border-violet-100">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-xl bg-violet-600 text-white hover:bg-violet-700 transition-colors font-medium"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
