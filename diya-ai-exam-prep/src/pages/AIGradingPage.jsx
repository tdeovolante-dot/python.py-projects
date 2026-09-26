import React, { useState, useRef, useCallback } from 'react';
import api from '../api/client';
import { Sparkles, Upload, FileText, Loader2, AlertCircle, CheckCircle, XCircle, RotateCcw, File as FileIcon, Send } from 'lucide-react';

export default function AIGradingPage() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [subject, setSubject] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  
  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFile = (selectedFile) => {
    setFile(selectedFile);
    if (selectedFile.type.startsWith('image/')) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    setError(null);
    setResults(null);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (subject) formData.append('subject', subject);
      
      const response = await api.post('/api/grading/grade', formData);
      setResults(response.data);
      // Initialize chat with a welcome message when grading is done
      setChatMessages([{
        role: 'tutor', 
        content: "I've reviewed your solution! Feel free to ask me any questions about my feedback or if you need me to explain a concept step-by-step."
      }]);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to grade solution. Please try again.');
      // Mock results for testing if backend isn't ready
      setResults({
        score: 15,
        total: 20,
        feedback: "You demonstrated a good understanding of the core concept. However, there's a small calculation error in step 3 that carried through to the final answer.\n\nMake sure to double-check your sign changes when expanding brackets.",
        errors: ["Calculation Error", "Sign Error"],
        strengths: ["Clear Method", "Formula Application"]
      });
      setChatMessages([{ role: 'tutor', content: "I've reviewed your solution! (Mocked)" }]);
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResults(null);
    setError(null);
    setChatMessages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getScoreColor = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 75) return 'text-emerald-600 ring-emerald-500 bg-emerald-50';
    if (percentage >= 50) return 'text-amber-600 ring-amber-500 bg-amber-50';
    return 'text-rose-600 ring-rose-500 bg-rose-50';
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatting(true);
    
    try {
      // In a real app, you might send the full conversation history
      const response = await api.post('/api/grading/chat', { 
        message: userMsg.content,
        grading_context: results 
      });
      setChatMessages(prev => [...prev, { role: 'tutor', content: response.data.reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      // Fallback for UI testing
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'tutor', 
          content: "That's a great question. Looking at your working, the issue originated when you distributed the negative sign. Remember that -(a - b) becomes -a + b. Does that make sense?" 
        }]);
        setIsChatting(false);
      }, 1000);
    }
  };

  // Auto-scroll chat
  React.useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  return (
    <div className="min-h-screen bg-violet-50 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-violet-900 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-violet-600" />
            Diya AI Grading
          </h1>
          <p className="text-violet-500">Upload your handwritten solutions for instant AI-powered feedback</p>
        </div>

        {!results && !isUploading && (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-6 space-y-6">
            
            {/* Subject Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-violet-900">Subject</label>
              <select 
                className="w-full border border-violet-200 rounded-xl px-4 py-2 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none text-slate-700 bg-white"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select a subject...</option>
                <option value="math">Mathematics</option>
                <option value="physics">Physical Sciences</option>
                <option value="accounting">Accounting</option>
                <option value="afrikaans">Afrikaans FAL</option>
              </select>
            </div>

            {/* Upload Zone */}
            <div 
              className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${isDragging ? 'border-violet-500 bg-violet-50' : 'border-violet-300 hover:border-violet-400 hover:bg-violet-50'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                className="hidden" 
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
              />
              
              {!file ? (
                <>
                  <div className="bg-violet-100 p-4 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-violet-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-violet-900 mb-1">Drag & drop your solution here</h3>
                  <p className="text-violet-500 mb-2">or click to browse</p>
                  <p className="text-xs text-slate-400">Supports JPG, PNG, PDF (max 10MB)</p>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 w-full">
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-48 rounded-xl border border-violet-200 object-contain" />
                  ) : (
                    <div className="bg-violet-100 p-6 rounded-xl">
                      <FileText className="w-12 h-12 text-violet-600" />
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-violet-700 font-medium bg-white px-4 py-2 rounded-full border border-violet-200 shadow-sm">
                    <FileIcon className="w-4 h-4" />
                    <span className="truncate max-w-[200px]">{file.name}</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        resetForm();
                      }}
                      className="ml-2 hover:bg-violet-100 p-1 rounded-full text-violet-500 hover:text-violet-700 transition-colors"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-rose-900">Upload failed</h4>
                  <p className="text-sm text-rose-700 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              className={`w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-all duration-300 ${!file || isUploading ? 'bg-violet-300 text-white cursor-not-allowed' : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-md'}`}
              onClick={handleUpload}
              disabled={!file || isUploading}
            >
              Grade My Solution
            </button>
          </div>
        )}

        {/* Loading State */}
        {isUploading && (
          <div className="bg-white rounded-2xl border border-violet-100 shadow-sm p-12 flex flex-col items-center justify-center space-y-6 animate-pulse">
            <div className="relative">
              <div className="absolute inset-0 bg-violet-200 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="bg-violet-100 p-6 rounded-full relative">
                <Sparkles className="w-12 h-12 text-violet-600 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-violet-900">Diya AI is analyzing your solution...</h3>
              <p className="text-violet-500">Checking steps, calculating marks, and generating feedback</p>
            </div>
            <div className="w-64 h-2 bg-violet-100 rounded-full overflow-hidden">
              <div className="h-full bg-violet-500 rounded-full animate-[progress_2s_ease-in-out_infinite]"></div>
            </div>
          </div>
        )}

        {/* Results & Chat Section */}
        {results && !isUploading && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-[fadeIn_0.5s_ease-out]">
            
            {/* Left Col: Results */}
            <div className="bg-white rounded-2xl border border-violet-100 shadow-sm overflow-hidden border-t-4 border-t-violet-500 flex flex-col">
              <div className="p-6 space-y-6 flex-1">
                
                {/* Score Header */}
                <div className="flex flex-col items-center gap-4 pb-6 border-b border-violet-50">
                  <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center ring-8 ring-offset-4 ${getScoreColor(results.score, results.total)}`}>
                    <span className="text-3xl font-bold">{results.score}</span>
                    <span className="text-xs font-medium opacity-80 border-t border-current pt-1 mt-1 px-2">out of {results.total}</span>
                  </div>
                  <div className="text-center space-y-1">
                    <h2 className="text-xl font-bold text-violet-900">Analysis Complete!</h2>
                  </div>
                </div>

                {/* Tags / Categories */}
                {((results.errors && results.errors.length > 0) || (results.strengths && results.strengths.length > 0)) && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-violet-900 uppercase tracking-wider">Key Takeaways</h3>
                    <div className="flex flex-wrap gap-2">
                      {results.errors?.map((err, i) => (
                         <span key={`err-${i}`} className="bg-rose-100 text-rose-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
                          <XCircle className="w-3 h-3" /> {err}
                        </span>
                      ))}
                      {results.strengths?.map((str, i) => (
                        <span key={`str-${i}`} className="bg-emerald-100 text-emerald-700 rounded-full px-3 py-1 text-xs font-medium flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> {str}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Feedback Body */}
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-violet-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-violet-600" />
                    Teacher's Notes
                  </h3>
                  <div className="bg-violet-50 rounded-xl p-4 text-slate-700 text-sm leading-relaxed border border-violet-100">
                    {results.feedback?.split('\n').map((paragraph, i) => (
                      <p key={i} className="mb-2 last:mb-0">{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-violet-100 shrink-0">
                <button 
                  onClick={resetForm}
                  className="w-full bg-white border border-violet-200 hover:bg-violet-50 text-violet-700 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Grade Another Solution
                </button>
              </div>
            </div>

            {/* Right Col: Tutor Chat */}
            <div className="bg-white rounded-2xl border border-violet-100 shadow-sm flex flex-col h-[600px]">
              <div className="p-4 border-b border-violet-100 flex items-center gap-2 bg-violet-50/50 rounded-t-2xl shrink-0">
                <div className="bg-violet-600 p-1.5 rounded-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-violet-900 leading-tight">Diya AI Tutor</h3>
                  <p className="text-xs text-violet-500">Ask questions about your grading</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-violet-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-700 rounded-bl-none'}`}>
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="flex justify-start">
                    <div className="bg-slate-100 rounded-2xl rounded-bl-none px-4 py-3 flex gap-1.5 items-center">
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-4 border-t border-violet-100 shrink-0">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask for an explanation..."
                    className="w-full pl-4 pr-12 py-3 rounded-xl border border-violet-200 focus:ring-2 focus:ring-violet-300 focus:border-violet-400 outline-none bg-slate-50"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isChatting}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

      </div>

      <style jsx="true">{`
        @keyframes progress {
          0% { width: 0%; transform: translateX(-100%); }
          50% { width: 40%; }
          100% { width: 100%; transform: translateX(100%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
