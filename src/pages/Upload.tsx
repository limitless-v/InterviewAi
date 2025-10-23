import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Upload as UploadIcon, FileText, Trash2, LogOut, MessageSquare } from 'lucide-react';

interface DocumentItem {
  id: string;
  type: 'resume' | 'job_description';
  file_name: string;
  created_at: string;
}

export default function Upload() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ resume?: number; job_description?: number }>({});
  const [dragOver, setDragOver] = useState<{ resume: boolean; job_description: boolean }>({ resume: false, job_description: false });
  const { signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const { data } = await api.get('/api/documents/list');
      setDocuments(
        (data.documents || []).map((d: any) => ({
          id: d._id,
          type: d.type,
          file_name: d.fileName,
          created_at: d.createdAt,
        }))
      );
    } catch {
      toast.error('Failed to load documents');
    }
  };

  const handleFileUpload = async (file: File, type: 'resume' | 'job_description') => {
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File size must be less than 2MB');
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are supported');
      return;
    }

    const form = new FormData();
    form.append('file', file);
    form.append('type', type);

    setUploading(true);
    setUploadProgress((p) => ({ ...p, [type]: 0 }));
    try {
      await api.post('/api/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => {
          const percent = e.total ? Math.round((e.loaded / e.total) * 100) : 0;
          setUploadProgress((p) => ({ ...p, [type]: percent }));
        },
      });
      toast.success(`${type === 'resume' ? 'Resume' : 'Job Description'} uploaded successfully!`);
      await loadDocuments();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || e?.message || 'Failed to upload file');
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress((p) => ({ ...p, [type]: 0 })), 800);
    }
  };

  const handleDragOver = (e: React.DragEvent, type: 'resume' | 'job_description') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: true }));
  };

  const handleDragLeave = (e: React.DragEvent, type: 'resume' | 'job_description') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
  };

  const handleDrop = (e: React.DragEvent, type: 'resume' | 'job_description') => {
    e.preventDefault();
    setDragOver(prev => ({ ...prev, [type]: false }));
    const files = e.dataTransfer.files;
    if (files.length > 0) handleFileUpload(files[0], type);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/documents/${id}`);
      toast.success('Document deleted');
      await loadDocuments();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to delete document');
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const canStartChat = () => {
    return (
      documents.some((d) => d.type === 'resume') &&
      documents.some((d) => d.type === 'job_description')
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100">
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">InterviewAI</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Upload Your Documents</h1>
          <p className="text-lg text-gray-600">Upload your resume and job description to start practicing</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Resume</h2>
            </div>

            <label className="block cursor-pointer">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                  dragOver.resume ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'
                }`}
                onDragOver={(e) => handleDragOver(e, 'resume')}
                onDragLeave={(e) => handleDragLeave(e, 'resume')}
                onDrop={(e) => handleDrop(e, 'resume')}
              >
                <UploadIcon className={`w-12 h-12 mx-auto mb-3 ${dragOver.resume ? 'text-blue-500' : 'text-gray-400'}`} />
                <p className="text-gray-600 mb-1">
                  <span className="text-blue-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">PDF (max 2MB)</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'resume')}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploadProgress.resume !== undefined && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadProgress.resume}%` }} />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-cyan-100 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-cyan-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">Job Description</h2>
            </div>

            <label className="block cursor-pointer">
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
                  dragOver.job_description ? 'border-cyan-500 bg-cyan-50' : 'border-gray-300 hover:border-cyan-500'
                }`}
                onDragOver={(e) => handleDragOver(e, 'job_description')}
                onDragLeave={(e) => handleDragLeave(e, 'job_description')}
                onDrop={(e) => handleDrop(e, 'job_description')}
              >
                <UploadIcon className={`w-12 h-12 mx-auto mb-3 ${dragOver.job_description ? 'text-cyan-500' : 'text-gray-400'}`} />
                <p className="text-gray-600 mb-1">
                  <span className="text-cyan-600 font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-sm text-gray-500">PDF (max 2MB)</p>
              </div>
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'job_description')}
                className="hidden"
                disabled={uploading}
              />
            </label>

            {uploadProgress.job_description !== undefined && (
              <div className="mt-4">
                <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-600 h-full transition-all duration-300" style={{ width: `${uploadProgress.job_description}%` }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {documents.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Documents</h2>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{doc.file_name}</p>
                      <p className="text-sm text-gray-500">
                        {doc.type === 'resume' ? 'Resume' : 'Job Description'} • {new Date(doc.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {canStartChat() && (
          <div className="text-center">
            <button onClick={() => navigate('/chat')} className="px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl">
              Start Interview Practice
            </button>
          </div>
        )}
      </main>
    </div>
  );
}