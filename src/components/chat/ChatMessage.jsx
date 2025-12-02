export default function ChatMessage({ message, personaName, isDarkMode }) {
  const isUser = message.role === 'user';

  if (isUser) {
    // User messages - right aligned, italic
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

  // Persona messages - left aligned with label
  return (
    <div className="flex justify-start mb-12">
      <div className="max-w-3xl space-y-3">
        <div className={`text-sm tracking-widest ${isDarkMode ? 'text-gray-600' : 'text-gray-400'} uppercase`}>
          {personaName}
        </div>
        <div className={`${isDarkMode ? 'text-[#e8e8e8]' : 'text-gray-900'}`}>
          <p className="whitespace-pre-wrap font-light leading-relaxed">{message.content}</p>
        </div>
        {message.validation && !message.validation.passed && (
          <p className="text-sm mt-2 text-yellow-600">⚠ {message.validation.warnings[0]}</p>
        )}
      </div>
    </div>
  );
}
