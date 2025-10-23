import { Link } from 'react-router-dom';
import { MessageSquare, FileText, Sparkles, TrendingUp } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-100">
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-2 rounded-lg">
            <MessageSquare className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">InterviewAI</span>
        </div>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-5 py-2 text-gray-700 hover:text-gray-900 font-medium transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
          >
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto mb-20">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Ace Your Next Interview with
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent"> AI-Powered Practice</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 leading-relaxed">
            Upload your resume and job description, then practice with our intelligent AI interviewer
            that generates personalized questions and provides real-time feedback.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            Start Practicing Free
            <Sparkles className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-blue-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Upload Documents</h3>
            <p className="text-gray-600 leading-relaxed">
              Simply drag and drop your resume and job description PDFs to get started.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-cyan-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-cyan-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Practice Interviews</h3>
            <p className="text-gray-600 leading-relaxed">
              Answer AI-generated questions tailored to the specific job requirements.
            </p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition">
            <div className="bg-green-100 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <TrendingUp className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Get Feedback</h3>
            <p className="text-gray-600 leading-relaxed">
              Receive instant scores and detailed feedback to improve your responses.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
