# InterviewAI (v2) – Express + MongoDB + Cloudinary + Groq

Practice job interviews with AI. Upload your resume and job description, then get tailored questions and feedback.

## Features

- **Authentication**: Email/password with JWT (`server/src/routes/auth.ts`)
- **PDF Uploads**: Resume + JD (≤2MB) to Cloudinary (`server/src/routes/documents.ts`), text extracted with `pdf-parse`
- **Chat & Evaluation**: Start a chat session and get feedback/scores (`server/src/routes/chat.ts`) using **Groq** by default
- **RAG Prep**: Text is chunked and embedded for relevance (`server/src/utils/{chunking,embeddings}.ts`)

## Tech Stack

- **Frontend**: React + TypeScript, Vite, Tailwind, Axios
- **Backend**: Node/Express, MongoDB (Mongoose), JWT, Cloudinary, Groq (default) or OpenAI

## Project Structure

```
server/
  src/
    app.ts                      # Express app, CORS, rate limiting, routes
    server.ts                   # Bootstraps Mongo + starts server
    config/env.ts               # Loads server/.env, asserts required vars
    middleware/auth.ts          # JWT auth middleware
    routes/{auth,documents,chat}.ts
    models/{User,Document,ChatSession}.ts
    utils/{cloudinary,chunking,embeddings,similarity}.ts
src/
  lib/api.ts                    # Axios client with Authorization header
  contexts/AuthContext.tsx      # JWT auth (signup/login/logout)
  pages/{Upload,Chat}.tsx       # API-integrated UI
```

## Environment Variables

Create `server/.env`:

```
PORT=8080
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
LLM_PROVIDER=groq
GROQ_API_KEY=your_groq_api_key
# Optional if you switch provider to OpenAI
OPENAI_API_KEY=your_openai_api_key

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
CLOUDINARY_FOLDER=interviewai
```

Create project root `.env` (frontend):

```
VITE_API_BASE_URL=http://localhost:8080
```

## Getting Started (Local)

1) Install deps
```
npm install
npm install --prefix server
```

2) Run backend
```
npm run build --prefix server
node server/dist/server.js
# Health check: http://localhost:8080/api/health -> { ok: true }
```

3) Run frontend
```
npm run dev
```

## API Endpoints

- `POST /api/auth/signup` `{ email, password }`
- `POST /api/auth/login` `{ email, password }`
- `POST /api/documents/upload` `FormData: file (pdf), type (resume|job_description)`
- `GET  /api/documents/list`
- `DELETE /api/documents/:id`
- `POST /api/chat/start` `{ resumeId, jdId }`
- `POST /api/chat/query` `{ sessionId, message }`

## CORS

Handled in `server/src/app.ts`. If you see CORS errors, ensure the backend is rebuilt/restarted and `VITE_API_BASE_URL` points to the API URL.

## LLM Provider

- Default provider is **Groq** (`LLM_PROVIDER=groq`). Set `GROQ_API_KEY` in `server/.env`.
- You can switch to OpenAI by setting `LLM_PROVIDER=openai` and adding `OPENAI_API_KEY`.
- Embeddings:
  - If `LLM_PROVIDER=openai`, the app uses OpenAI embeddings.
  - Otherwise, it uses a lightweight local embedding fallback (no external API).

## Troubleshooting

- **CORS errors**: Verify CORS middleware, restart backend, confirm `VITE_API_BASE_URL`.
- **Mongo errors**: Check `MONGODB_URI` (Atlas SRV requires proper URI and IP allowlist).
- **PDF parse errors**: Only PDFs allowed, ≤2MB; ensure file type/size.
- **Groq 429**: Too many requests/quota. Check Groq console/limits. The API returns a 429 with `code: "LLM_QUOTA"`.
- **Provider mismatch**: Use `GET /api/llm/health` to verify `{ provider, hasGroqKey, hasOpenAIKey }`.

---

# Legacy README (Supabase version)

# InterviewAI - Job Interview Simulation Platform

A full-stack SPA that helps users practice job interviews with an AI interviewer. Upload your resume and job description, then receive personalized questions and real-time feedback.

## Features

- **Authentication**: Secure email/password signup and login using Supabase Auth
- **Document Upload**: Upload resume and job description PDFs (max 2MB each)
- **AI Interview**: Chat with an AI interviewer that generates questions from the job description
- **Real-time Feedback**: Receive scores (1-10) and detailed feedback on your responses
- **RAG Integration**: AI evaluates responses based on your resume content

## Tech Stack

### Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Hot Toast for notifications
- Lucide React for icons

### Backend
- Supabase (PostgreSQL database)
- Supabase Edge Functions (Deno runtime)
- Supabase Auth for authentication
- Supabase Storage for file management
- OpenAI API for AI capabilities

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- Supabase account (already configured)
- OpenAI API key

### Environment Variables

The project requires an OpenAI API key to be configured. Add the following to Supabase Edge Functions secrets:

```bash
# In Supabase Dashboard, go to Edge Functions settings and add:
OPENAI_API_KEY=your_openai_api_key_here
```

All other environment variables are pre-configured in `.env`.

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/         # Reusable components
│   └── ProtectedRoute.tsx
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── lib/              # Utilities and configurations
│   └── supabase.ts
├── pages/            # Page components
│   ├── Landing.tsx
│   ├── Login.tsx
│   ├── Signup.tsx
│   ├── Upload.tsx
│   └── Chat.tsx
├── App.tsx           # Main app component
└── main.tsx          # Entry point
```

## Database Schema

### Tables

**documents**
- Stores uploaded resumes and job descriptions
- Includes file metadata and extracted text content
- Row Level Security enabled

**chat_sessions**
- Stores interview chat sessions
- Contains messages array with user responses and AI feedback
- Links to associated resume and job description

## Edge Functions

### upload-document
- Handles file upload to Supabase Storage
- Extracts text content from PDFs
- Stores document metadata in database

### chat
- Generates initial interview questions from job description
- Evaluates user responses using OpenAI
- Provides scores and feedback based on resume context

## Usage Flow

1. **Sign Up/Login**: Create an account or sign in
2. **Upload Documents**: Upload your resume and job description (PDF format)
3. **Start Interview**: Begin chat session with AI interviewer
4. **Answer Questions**: Respond to AI-generated questions
5. **Get Feedback**: Receive instant scores and detailed feedback

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase Auth
- Protected routes for authenticated users only
- Session management with automatic token refresh

### File Upload
- Drag-and-drop interface
- Real-time upload progress
- File validation (PDF only, max 2MB)
- Storage in Supabase Storage bucket

### AI Chat
- OpenAI GPT-3.5 Turbo integration
- Context-aware question generation
- Response evaluation with scoring
- Resume-based feedback

### Security
- Row Level Security (RLS) on all tables
- JWT authentication for API calls
- Secure file storage with user-scoped access
- CORS headers on all Edge Functions

## Deployment

### Frontend
Deploy to Vercel or Netlify:
```bash
npm run build
# Upload dist/ folder or connect git repository
```

### Backend
Edge Functions are already deployed to Supabase. To update:
- Use Supabase Dashboard or CLI
- All secrets are managed through Supabase settings

## API Endpoints

### Edge Functions

**POST /functions/v1/upload-document**
- Upload a document (resume or job description)
- Requires authentication
- Body: FormData with file and type

**POST /functions/v1/chat**
- Start a chat session or send a message
- Requires authentication
- Body: { action, sessionId?, message?, resumeId?, jdId? }

## Environment Variables Reference

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Edge Functions (configured in Supabase):
```
OPENAI_API_KEY=your_openai_key
```

## Development Notes

- All PDF text extraction is handled server-side in Edge Functions
- The app uses basic text content extraction (not full PDF parsing libraries)
- Chat sessions store full conversation history in JSONB format
- OpenAI responses include structured feedback with scores

## License

MIT
