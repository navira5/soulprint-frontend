import { useState } from 'react';
import { Wrench, X, Check } from 'lucide-react';

export default function FeedbackInput({ personaId, onFeedbackSubmit, isDarkMode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onFeedbackSubmit(feedbackText);
      setShowSuccess(true);
      setFeedbackText('');

      // Auto-close after success
      setTimeout(() => {
        setShowSuccess(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Feedback submission failed:', error);
      // You could add error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  const bgColor = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white';
  const borderColor = isDarkMode ? 'border-gray-900' : 'border-gray-200';
  const textColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = isDarkMode ? 'hover:bg-white/5' : 'hover:bg-gray-100';

  if (showSuccess) {
    return (
      <div className={`border-t ${borderColor} ${bgColor}`}>
        <div className="max-w-4xl mx-auto px-8 py-4">
          <div className="flex items-center gap-3 text-green-500">
            <Check className="w-5 h-5" />
            <span className="text-sm tracking-wide">Feedback received — persona will adjust over time</span>
          </div>
        </div>
      </div>
    );
  }

  if (!isOpen) {
    return (
      <div className={`border-t ${borderColor} ${bgColor}`}>
        <div className="max-w-4xl mx-auto px-8 py-4">
          <button
            onClick={() => setIsOpen(true)}
            className={`flex items-center gap-2 text-sm tracking-wide ${textColor} ${hoverBg} px-4 py-2 transition-colors duration-300`}
          >
            <Wrench className="w-4 h-4" />
            <span>GIVE FEEDBACK</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border-t ${borderColor} ${bgColor}`}>
      <div className="max-w-4xl mx-auto px-8 py-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 text-sm tracking-wide text-gray-500">
              <Wrench className="w-4 h-4" />
              <span>ADJUST PERSONA STYLE</span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className={`${textColor} ${hoverBg} p-1 transition-colors duration-300`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            placeholder="e.g., 'Stop starting every response with you know' or 'Be more concise' or 'Use less technical jargon'"
            disabled={isSubmitting}
            rows={3}
            className={`w-full ${bgColor} px-4 py-3 text-base font-light border-2 ${
              isDarkMode
                ? 'text-white placeholder-gray-600 border-gray-700 focus:border-gray-500'
                : 'text-gray-900 placeholder-gray-400 border-gray-300 focus:border-gray-400'
            } focus:outline-none transition-colors duration-500 resize-none`}
          />

          <div className="flex items-center justify-between">
            <p className="text-xs tracking-wide text-gray-600">
              Natural language feedback — the persona will adjust gradually
            </p>
            <button
              type="submit"
              disabled={isSubmitting || !feedbackText.trim()}
              className={`px-6 py-2 text-sm tracking-widest font-light border-2 transition-all duration-500 ${
                isSubmitting || !feedbackText.trim()
                  ? `${borderColor} bg-transparent opacity-40 cursor-not-allowed ${
                      isDarkMode ? 'text-gray-700' : 'text-gray-400'
                    }`
                  : isDarkMode
                  ? 'bg-white/10 border-gray-500 text-white hover:bg-white/20'
                  : 'bg-gray-100 border-gray-400 text-gray-900 hover:bg-gray-200'
              }`}
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
