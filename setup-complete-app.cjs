#!/usr/bin/env node
/**
 * Complete Soulprint React App Generator
 *
 * This script generates all necessary files for the complete React application.
 * Run with: node setup-complete-app.js
 */

const fs = require('fs');
const path = require('path');

// Helper to write files
function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
  console.log(`✓ Created: ${filePath}`);
}

// ============================================================================
// ENVIRONMENT CONFIG
// ============================================================================

const envLocal = `VITE_API_BASE_URL=http://localhost:5001
`;

// ============================================================================
// API CLIENT
// ============================================================================

const apiEndpoints = `import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';

const apiClient = axios.create({
  baseURL: \`\${API_BASE_URL}/api\`,
  timeout: 120000,
});

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMessage = error.response?.data?.error || error.message || 'Network error';
    return Promise.reject(new Error(errorMessage));
  }
);

export const getPersonas = async () => {
  return apiClient.get('/personas');
};

export const getPersonaSoulSeed = async (personaId) => {
  return apiClient.get('/persona/soulseed/latest', {
    params: { persona_id: personaId },
  });
};

export const initChatSession = async (personaId) => {
  return apiClient.post('/persona/chat/init', { persona_id: personaId });
};

export const sendChatMessage = async (sessionId, message) => {
  return apiClient.post('/persona/chat', { session_id: sessionId, message });
};

export const applyFeedback = async (personaId, feedbackText) => {
  return apiClient.post('/persona/feedback', {
    persona_id: personaId,
    feedback_text: feedbackText,
  });
};

export default apiClient;
`;

// ============================================================================
// ZUSTAND STORES
// ============================================================================

const chatStore = `import { create } from 'zustand';
import { initChatSession, sendChatMessage } from '../api/endpoints';

export const useChatStore = create((set, get) => ({
  sessionId: null,
  personaInfo: null,
  messages: [],
  isLoading: false,
  error: null,

  initSession: async (personaId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await initChatSession(personaId);
      set({
        sessionId: response.session_id,
        personaInfo: response.persona_info,
        messages: [],
        isLoading: false,
      });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  sendMessage: async (message) => {
    const { sessionId, messages } = get();
    if (!sessionId) return;

    const userMessage = { role: 'user', content: message, timestamp: new Date() };
    set({ messages: [...messages, userMessage], isLoading: true });

    try {
      const response = await sendChatMessage(sessionId, message);
      const assistantMessage = {
        role: 'assistant',
        content: response.response,
        validation: response.validation,
        context: response.context,
        timestamp: new Date(),
      };
      set({ messages: [...get().messages, assistantMessage], isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  clearSession: () => {
    set({ sessionId: null, personaInfo: null, messages: [], error: null });
  },
}));
`;

const personaStore = `import { create } from 'zustand';
import { getPersonas, getPersonaSoulSeed } from '../api/endpoints';

export const usePersonaStore = create((set) => ({
  personas: [],
  currentPersona: null,
  loading: false,
  error: null,

  fetchPersonas: async () => {
    set({ loading: true, error: null });
    try {
      const personas = await getPersonas();
      set({ personas, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchPersonaById: async (personaId) => {
    set({ loading: true, error: null });
    try {
      const persona = await getPersonaSoulSeed(personaId);
      set({ currentPersona: persona, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },
}));
`;

// ============================================================================
// COMPONENTS
// ============================================================================

const Header = `import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-3xl font-bold">
            Soulprint
          </Link>
          <nav className="space-x-6">
            <Link to="/" className="hover:text-primary-100 transition">Home</Link>
            <Link to="/personas" className="hover:text-primary-100 transition">Personas</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
`;

const ChatMessage = `export default function ChatMessage({ message }) {
  const isUser = message.role === 'user';

  return (
    <div className={\`flex \${isUser ? 'justify-end' : 'justify-start'} mb-4\`}>
      <div className={\`max-w-3xl px-4 py-2 rounded-lg \${
        isUser
          ? 'bg-primary-600 text-white'
          : 'bg-gray-200 text-gray-900'
      }\`}>
        <p>{message.content}</p>
        {message.validation && !message.validation.passed && (
          <p className="text-xs mt-1 opacity-75">⚠ {message.validation.warnings[0]}</p>
        )}
      </div>
    </div>
  );
}
`;

const ChatInput = `import { useState } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border-t p-4 bg-white">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          disabled={disabled}
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition"
        >
          Send
        </button>
      </div>
    </form>
  );
}
`;

const LoadingSpinner = `export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
    </div>
  );
}
`;

// ============================================================================
// PAGES
// ============================================================================

const HomePage = `import { useNavigate } from 'react-router-dom';
import { usePersonaStore } from '../store/personaStore';
import { useEffect } from 'react';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function HomePage() {
  const navigate = useNavigate();
  const { personas, loading, fetchPersonas } = usePersonaStore();

  useEffect(() => {
    fetchPersonas();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Soulprint
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Build Thought Partners From Human Identity
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Transform conversations into AI personas that think, communicate, and reason like the people they represent
          </p>
        </div>

        {/* Personas List */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Available Personas</h2>

          {loading ? (
            <LoadingSpinner />
          ) : personas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No personas available yet</p>
              <p className="text-sm text-gray-400">Upload a transcript to create your first persona</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {personas.map((persona) => (
                <div
                  key={persona.persona_id}
                  className="border rounded-lg p-6 hover:shadow-lg transition cursor-pointer"
                  onClick={() => navigate(\`/chat/\${persona.persona_id}\`)}
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{persona.persona_id}</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    {persona.total_sources} {persona.total_sources === 1 ? 'source' : 'sources'}
                  </p>
                  <button className="w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                    Start Chat
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
`;

const ChatPage = `import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useChatStore } from '../store/chatStore';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function ChatPage() {
  const { personaId } = useParams();
  const messagesEndRef = useRef(null);

  const { sessionId, messages, isLoading, error, initSession, sendMessage } = useChatStore();

  useEffect(() => {
    if (personaId) {
      initSession(personaId);
    }
  }, [personaId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!sessionId && isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Initializing chat with {personaId}...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Chat Header */}
      <div className="bg-white border-b px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">Chat with {personaId}</h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-20">
            <p className="text-lg mb-2">Start a conversation with {personaId}</p>
            <p className="text-sm">Ask anything about their thoughts, perspectives, or ideas</p>
          </div>
        ) : (
          <>
            {messages.map((msg, idx) => (
              <ChatMessage key={idx} message={msg} />
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="bg-gray-200 px-4 py-2 rounded-lg">
                  <p className="text-gray-600">Thinking...</p>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
`;

const PersonasPage = `import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePersonaStore } from '../store/personaStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function PersonasPage() {
  const navigate = useNavigate();
  const { personas, loading, fetchPersonas } = usePersonaStore();

  useEffect(() => {
    fetchPersonas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">All Personas</h1>

        {loading ? (
          <LoadingSpinner />
        ) : personas.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500 text-lg">No personas available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {personas.map((persona) => (
              <div
                key={persona.persona_id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition p-6 cursor-pointer"
                onClick={() => navigate(\`/chat/\${persona.persona_id}\`)}
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{persona.persona_id}</h2>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Sources: {persona.total_sources}</p>
                  <p>Versions: {persona.total_versions}</p>
                  <p className="text-xs text-gray-400">Updated: {persona.latest_source_date}</p>
                </div>
                <button className="mt-4 w-full bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700 transition">
                  Chat Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
`;

// ============================================================================
// APP & MAIN
// ============================================================================

const App = `import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import PersonasPage from './pages/PersonasPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/personas" element={<PersonasPage />} />
          <Route path="/chat/:personaId" element={<ChatPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
`;

const mainJsx = `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;

const indexCss = `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply antialiased;
  }
}
`;

// ============================================================================
// README
// ============================================================================

const readme = `# Soulprint Frontend

Complete React frontend for the Soulprint application.

## Features

- Chat with AI personas built from human transcripts
- View all available personas
- Real-time message streaming
- Clean, modern UI with Tailwind CSS
- Full integration with Flask backend API

## Setup

1. **Install Dependencies**
\`\`\`bash
npm install
\`\`\`

2. **Configure Environment**
\`\`\`bash
# .env.local is already created with:
VITE_API_BASE_URL=http://localhost:5001
\`\`\`

3. **Start Backend**
\`\`\`bash
# In soulprint-analyzer directory
python3 app.py
\`\`\`

4. **Start Frontend**
\`\`\`bash
npm run dev
\`\`\`

5. **Open Browser**
\`\`\`
http://localhost:5173
\`\`\`

## Project Structure

\`\`\`
src/
├── api/
│   └── endpoints.js          # API client functions
├── store/
│   ├── chatStore.js         # Chat state management
│   └── personaStore.js      # Persona data management
├── components/
│   ├── layout/
│   │   └── Header.jsx       # App header
│   ├── chat/
│   │   ├── ChatMessage.jsx  # Message bubble
│   │   └── ChatInput.jsx    # Message input
│   └── shared/
│       └── LoadingSpinner.jsx
├── pages/
│   ├── HomePage.jsx         # Landing page
│   ├── PersonasPage.jsx     # Browse personas
│   └── ChatPage.jsx         # Chat interface
├── App.jsx                  # Main app + routing
├── main.jsx                 # Entry point
└── index.css                # Global styles
\`\`\`

## Available Routes

- \`/\` - Home page with persona list
- \`/personas\` - Browse all personas
- \`/chat/:personaId\` - Chat with specific persona

## Tech Stack

- React 18+ with Vite
- React Router for routing
- Zustand for state management
- Axios for API calls
- Tailwind CSS for styling
- Lucide React for icons

## API Integration

Connects to Flask backend at \`http://localhost:5001/api\`:

- \`GET /api/personas\` - List personas
- \`GET /api/persona/soulseed/latest\` - Get persona details
- \`POST /api/persona/chat/init\` - Initialize chat session
- \`POST /api/persona/chat\` - Send message
- \`POST /api/persona/feedback\` - Apply feedback

## Development

\`\`\`bash
npm run dev     # Start dev server
npm run build   # Build for production
npm run preview # Preview production build
\`\`\`

## Next Steps

1. Add upload flow component for creating new personas
2. Add persona detail view with tabs
3. Add feedback panel for adjusting preferences
4. Implement toast notifications
5. Add dark mode support
`;

// ============================================================================
// GENERATE ALL FILES
// ============================================================================

console.log('\\n🚀 Generating Complete Soulprint React App...\\n');

// Environment
writeFile('.env.local', envLocal);

// API
writeFile('src/api/endpoints.js', apiEndpoints);

// Stores
writeFile('src/store/chatStore.js', chatStore);
writeFile('src/store/personaStore.js', personaStore);

// Components
writeFile('src/components/layout/Header.jsx', Header);
writeFile('src/components/chat/ChatMessage.jsx', ChatMessage);
writeFile('src/components/chat/ChatInput.jsx', ChatInput);
writeFile('src/components/shared/LoadingSpinner.jsx', LoadingSpinner);

// Pages
writeFile('src/pages/HomePage.jsx', HomePage);
writeFile('src/pages/ChatPage.jsx', ChatPage);
writeFile('src/pages/PersonasPage.jsx', PersonasPage);

// App files
writeFile('src/App.jsx', App);
writeFile('src/main.jsx', mainJsx);
writeFile('src/index.css', indexCss);

// README
writeFile('README.md', readme);

console.log('\\n✅ Complete! All files generated.\\n');
console.log('Next steps:');
console.log('1. npm run dev');
console.log('2. Open http://localhost:5173\\n');
