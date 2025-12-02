import { useState } from 'react';

export default function ChatInput({ onSend, disabled, isDarkMode }) {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && !disabled) {
      onSend(input);
      setInput('');
    }
  };

  const bgColor = isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white';
  const formBorderColor = isDarkMode ? 'border-gray-900' : 'border-gray-200';

  return (
    <form onSubmit={handleSubmit} className={`border-t ${formBorderColor} ${bgColor}`}>
      <div className="max-w-4xl mx-auto px-8 py-8">
        <div className="flex gap-4 items-stretch">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={disabled}
            style={{ minHeight: '56px' }}
            className={`flex-1 ${bgColor} px-6 py-4 text-base font-light focus:outline-none transition-colors duration-500 ${
              isDarkMode
                ? 'text-white placeholder-gray-500 border-2 border-gray-600 focus:border-gray-500'
                : 'text-gray-900 placeholder-gray-400 border-2 border-gray-300 focus:border-gray-400'
            }`}
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className={`px-10 py-4 text-sm tracking-widest font-light border-2 transition-all duration-500 ${
              disabled || !input.trim()
                ? `${formBorderColor} bg-transparent opacity-40 cursor-not-allowed ${isDarkMode ? 'text-gray-700' : 'text-gray-400'}`
                : isDarkMode
                ? 'bg-white/10 border-gray-500 text-white hover:bg-white/20'
                : 'bg-gray-100 border-gray-400 text-gray-900 hover:bg-gray-200'
            }`}
          >
            SEND
          </button>
        </div>
      </div>
    </form>
  );
}
