import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useUploadStore } from '../../store/uploadStore';
import { usePersonaStore } from '../../store/personaStore';

export default function ModeSelector() {
  const navigate = useNavigate();
  const { selectedMode, setMode } = useUploadStore();
  const { personas } = usePersonaStore();
  const [showCouncilDropdown, setShowCouncilDropdown] = useState(false);

  const isDarkMode = true; // Matches the dark theme from your screenshot

  return (
    <div className="flex items-center justify-center gap-6 mb-20">
      {/* CREATE PERSONA Button */}
      <button
        onClick={() => setMode('human')}
        className={`px-16 py-5 text-xl font-light tracking-widest transition-all duration-300 ${
          selectedMode === 'human'
            ? 'bg-white text-black border-2 border-white'
            : 'bg-transparent text-gray-400 border-2 border-gray-700 hover:border-gray-500 hover:text-gray-300'
        }`}
      >
        CREATE PERSONA
      </button>

      {/* YOUR COUNCIL Dropdown */}
      <div className="relative">
        <button
          onClick={() => setShowCouncilDropdown(!showCouncilDropdown)}
          className={`px-16 py-5 text-xl font-light tracking-widest transition-all duration-300 flex items-center gap-3 ${
            selectedMode === 'council'
              ? 'bg-black text-white border-2 border-gray-700'
              : 'bg-transparent text-gray-400 border-2 border-gray-700 hover:border-gray-500 hover:text-gray-300'
          }`}
        >
          <span>YOUR COUNCIL</span>
          <ChevronDown className="w-6 h-6" />
        </button>

        {showCouncilDropdown && personas.length > 0 && (
          <div className="absolute top-full left-0 mt-2 bg-black border-2 border-gray-800 min-w-[300px] z-50">
            <div className="text-sm tracking-widest text-gray-500 px-4 py-3 border-b border-gray-900">
              YOUR COUNCIL
            </div>
            {personas.map((persona) => (
              <button
                key={persona.persona_id}
                onClick={() => {
                  navigate(`/persona/${persona.persona_id}/chat`);
                  setShowCouncilDropdown(false);
                }}
                className="w-full text-left px-4 py-3 text-base font-light text-white hover:bg-white/5 transition-colors duration-300 border-b border-gray-900 capitalize"
              >
                {persona.persona_id}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
