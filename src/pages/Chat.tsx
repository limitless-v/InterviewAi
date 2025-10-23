import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { Send, LogOut, MessageSquare, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  score?: number;
  timestamp: string;
}

interface ChatSession {
  id: string;
  messages: Message[];
}

export default function Chat() {
  const [session, setSession] = useState<ChatSession | null>(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      initializeChat();
    }
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [session?.messages]);

  const initializeChat = async () => {
    try {
      const { data } = await api.get('/api/documents/list');
      const documents: { id: string; type: 'resume' | 'job_description' }[] = (data.documents || []).map((d: any) => ({ id: d._id as string, type: d.type as 'resume' | 'job_description' }));

      if (!documents || documents.length < 2) {
        toast.error('Please upload both resume and job description first');
        navigate('/upload');
        return;
      }

      const resume = documents.find((d) => d.type === 'resume');
      const jd = documents.find((d) => d.type === 'job_description');

      if (!resume || !jd) {
        toast.error('Please upload both resume and job description first');
        navigate('/upload');
        return;
      }

      setLoading(true);

      const start = await api.post('/api/chat/start', { resumeId: resume.id, jdId: jd.id });
      const startedSession = start.data.session;
      setSession({ id: startedSession._id, messages: [{ role: 'assistant', content: start.data.questions, timestamp: new Date().toISOString() }] });
    } catch (error: any) {
      toast.error(error.message || 'Failed to initialize chat');
      navigate('/upload');
    } finally {
      setLoading(false);
      setInitializing(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim() || !session) return;

    const userMessage = message.trim();
    setMessage('');
    setLoading(true);

    try {
      const { data } = await api.post('/api/chat/query', { sessionId: session.id, message: userMessage });

      setSession({
        ...session,
        messages: [
          ...session.messages,
          {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString(),
          },
          {
            role: 'assistant',
            content: data.evaluation.feedback,
            score: data.evaluation.score,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Starting your interview session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">InterviewAI</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/upload')}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition"
            >
              My Documents
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl flex flex-col">
        <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Interview Practice Session
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {session?.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  {msg.score !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">Score:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-green-500 h-full transition-all duration-500" style={{ width: `${msg.score * 10}%` }} />
                        </div>
                        <span className="text-sm font-bold">{msg.score}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl px-5 py-3">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your answer..."
                disabled={loading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="submit"
                disabled={loading || !message.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
