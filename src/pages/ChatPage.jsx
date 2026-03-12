import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronLeft } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { usePersonaStore } from '../store/personaStore';
import { applyMessageFeedback } from '../api/endpoints';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function ChatPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const { personas, fetchPersonas } = usePersonaStore();
  const { sessionId, messages, isLoading, error, initSession, sendMessage } = useChatStore();

  const [showPersonaDropdown, setShowPersonaDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('soulprint-theme');
    return saved === null ? true : saved === 'dark';
  });

  useEffect(() => {
    if (id) {
      initSession(id);
    }
    fetchPersonas();
  }, [id, initSession, fetchPersonas]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('soulprint-theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Handler for per-message voice feedback
  const handleMessageFeedback = async (sessionId, messageIndex, feedbackText) => {
    return applyMessageFeedback(sessionId, messageIndex, feedbackText);
  };

  const bgColor = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white';
  const textColor = isDarkMode ? 'text-[#e8e8e8]' : 'text-gray-900';
  const borderColor = isDarkMode ? 'border-gray-900' : 'border-gray-200';
  const hoverBg = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  if (!sessionId && isLoading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColor} ${textColor}`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">Initializing chat with {id}...</p>
        </div>
      </div>
    );
  }

  if (error && !sessionId) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${bgColor} ${textColor}`}>
        <div className="border border-red-900 bg-red-950/20 rounded-lg p-6 max-w-md">
          <h2 className="text-xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${bgColor} ${textColor}`}>
      {/* Header */}
      <header className={`border-b ${borderColor} px-4 sm:px-8 py-4 sm:py-6`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Left: Back Button */}
          <button
            onClick={() => navigate('/')}
            className={`flex items-center gap-1 sm:gap-2 text-sm tracking-wide text-gray-500 hover:text-gray-400 transition-colors duration-500`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">BACK</span>
          </button>

          {/* Center: Persona Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowPersonaDropdown(!showPersonaDropdown)}
              className="flex items-center gap-1 sm:gap-2 text-base font-light tracking-wide hover:text-gray-400 transition-colors duration-500 capitalize"
            >
              <span>{id}</span>
              <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {showPersonaDropdown && (
              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${isDarkMode ? 'bg-black' : 'bg-white'} border ${isDarkMode ? 'border-gray-800' : 'border-gray-200'} min-w-[200px] max-w-[90vw] z-50`}>
                <div className={`text-sm tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} px-4 py-3 border-b ${isDarkMode ? 'border-gray-900' : 'border-gray-200'}`}>
                  YOUR COUNCIL
                </div>
                {personas.map((persona) => (
                  <button
                    key={persona.persona_id}
                    onClick={() => {
                      navigate(`/persona/${persona.persona_id}/chat`);
                      setShowPersonaDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-base font-light ${hoverBg} transition-colors duration-300 border-b ${isDarkMode ? 'border-gray-900' : 'border-gray-200'} capitalize`}
                  >
                    {persona.persona_id}
                  </button>
                ))}
                <button
                  onClick={() => {
                    navigate('/');
                    setShowPersonaDropdown(false);
                  }}
                  className={`w-full text-left px-4 py-3 text-sm tracking-widest ${isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-300`}
                >
                  + NEW PERSONA
                </button>
              </div>
            )}
          </div>

          {/* Right: Theme Toggle + SOULPRINT */}
          <div className="flex items-center gap-3 sm:gap-8">
            <button
              onClick={toggleTheme}
              className={`text-xs sm:text-sm tracking-widest ${isDarkMode ? 'text-gray-500 hover:text-gray-400' : 'text-gray-500 hover:text-gray-700'} transition-colors duration-500`}
            >
              {isDarkMode ? 'LIGHT' : 'DARK'}
            </button>
            <div className={`hidden sm:block text-sm tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              SOULPRINT
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 sm:py-12">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className={`text-center ${isDarkMode ? 'text-gray-600' : 'text-gray-500'} mt-20`}>
              <p className="text-lg mb-2 font-light">What do you want to talk about? I'm here to think through problems with you.</p>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                // Calculate assistant message index for feedback
                const assistantIndex = msg.role === 'assistant'
                  ? messages.slice(0, idx + 1).filter(m => m.role === 'assistant').length - 1
                  : null;

                return (
                  <ChatMessage
                    key={idx}
                    message={msg}
                    personaName={id}
                    isDarkMode={isDarkMode}
                    messageIndex={assistantIndex}
                    sessionId={sessionId}
                    onFeedbackSubmit={handleMessageFeedback}
                  />
                );
              })}
              {isLoading && (
                <div className="flex justify-start mb-8">
                  <div className="space-y-2">
                    <div className={`text-sm tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} uppercase`}>
                      {id}
                    </div>
                    <div className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      <p className="font-light">Thinking...</p>
                    </div>
                  </div>
                </div>
              )}
              {error && sessionId && (
                <div className="flex justify-start mb-8">
                  <div className="border border-red-900 bg-red-950/20 rounded-lg p-4 max-w-2xl">
                    <p className="text-red-400 font-light">Error: {error}</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={sendMessage} disabled={isLoading} isDarkMode={isDarkMode} />
    </div>
  );
}
