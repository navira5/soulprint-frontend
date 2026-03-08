import { useState } from 'react';
import { MessageSquare, X, Check, Loader2 } from 'lucide-react';

export default function ChatMessage({
  message,
  personaName,
  isDarkMode,
  messageIndex,
  sessionId,
  onFeedbackSubmit
}) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [feedbackError, setFeedbackError] = useState(null);

  const isUser = message.role === 'user';

  const handleFeedback = async () => {
    if (!feedbackText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setFeedbackError(null);

    try {
      await onFeedbackSubmit(sessionId, messageIndex, feedbackText);
      setFeedbackSuccess(true);
      setTimeout(() => {
        setShowFeedback(false);
        setFeedbackSuccess(false);
        setFeedbackText('');
      }, 2000);
    } catch (error) {
      console.error('Feedback failed:', error);
      setFeedbackError(error.message || 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleFeedback();
    }
  };

  if (isUser) {
    // User messages - right aligned, italic (no feedback option)
    return (
      <div className="flex justify-end mb-12">
        <div className="max-w-3xl">
          <p className={`text-base font-light italic leading-relaxed ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
            {message.content}
          </p>
        </div>
      </div>
    );
  }

  // Persona messages - left aligned with label and feedback option
  return (
    <div className="flex justify-start mb-12 group">
      <div className="max-w-3xl space-y-3 w-full">
        {/* Header row with persona name and feedback button */}
        <div className="flex items-center justify-between">
          <div className={`text-sm tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} uppercase`}>
            {personaName}
          </div>

          {/* Feedback button - appears on hover */}
          {onFeedbackSubmit && sessionId !== undefined && messageIndex !== undefined && (
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className={`opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-1.5 rounded ${
                showFeedback
                  ? (isDarkMode ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700')
                  : (isDarkMode ? 'hover:bg-white/10 text-gray-500' : 'hover:bg-gray-100 text-gray-400')
              }`}
              title="Give feedback on this response"
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Message content */}
        <div className={`${isDarkMode ? 'text-[#e8e8e8]' : 'text-gray-900'}`}>
          <p className="whitespace-pre-wrap font-light leading-relaxed">{message.content}</p>
        </div>

        {/* Inline feedback form */}
        {showFeedback && (
          <div className={`mt-4 p-4 rounded-lg border ${
            isDarkMode ? 'bg-gray-900/50 border-gray-700' : 'bg-gray-50 border-gray-200'
          }`}>
            {feedbackSuccess ? (
              <div className="flex items-center gap-2 text-green-500">
                <Check className="w-4 h-4" />
                <span className="text-sm">Feedback applied - future responses will be adjusted</span>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs tracking-wide uppercase ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Voice Feedback
                  </span>
                  <button
                    onClick={() => {
                      setShowFeedback(false);
                      setFeedbackText('');
                      setFeedbackError(null);
                    }}
                    className={`p-1 rounded ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>

                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g., 'This sounds too generic' or 'They would be more direct' or 'Use more of their signature phrases'"
                  rows={2}
                  className={`w-full px-3 py-2 text-sm rounded-md border ${
                    isDarkMode
                      ? 'bg-black border-gray-700 text-white placeholder-gray-600 focus:border-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-gray-400'
                  } focus:outline-none transition-colors`}
                />

                {feedbackError && (
                  <p className="text-xs text-red-500 mt-2">{feedbackError}</p>
                )}

                <div className="flex justify-between items-center mt-3">
                  <span className={`text-xs ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    Press Enter to submit
                  </span>
                  <button
                    onClick={handleFeedback}
                    disabled={isSubmitting || !feedbackText.trim()}
                    className={`px-4 py-1.5 text-xs tracking-wide uppercase rounded transition-all ${
                      isSubmitting || !feedbackText.trim()
                        ? 'opacity-50 cursor-not-allowed'
                        : isDarkMode
                        ? 'bg-white/10 hover:bg-white/20 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                    }`}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Applying...
                      </span>
                    ) : (
                      'Apply'
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Validation warning (existing functionality) */}
        {message.validation && !message.validation.passed && (
          <p className="text-sm mt-2 text-yellow-600">⚠ {message.validation.warnings[0]}</p>
        )}
      </div>
    </div>
  );
}
