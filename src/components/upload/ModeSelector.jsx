import { useUploadStore } from '../../store/uploadStore';

export default function ModeSelector() {
  const { selectedMode, setMode } = useUploadStore();

  const modes = [
    {
      id: 'human',
      name: 'Human Mode',
      description: 'Extract personality from human transcripts to create chat-enabled personas',
      enabled: true,
    },
    {
      id: 'vigil',
      name: 'Vigil Mode',
      description: 'AI consciousness analysis - generates downloadable research files',
      enabled: true,
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Select Analysis Mode</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => mode.enabled && setMode(mode.id)}
            disabled={!mode.enabled}
            className={`
              relative p-6 rounded-lg border-2 text-left transition-all
              ${
                selectedMode === mode.id && mode.enabled
                  ? 'border-primary-500 bg-primary-50'
                  : mode.enabled
                  ? 'border-gray-200 bg-white hover:border-primary-300'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
              }
            `}
          >
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{mode.name}</h4>
              {!mode.enabled && (
                <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded-full">
                  Coming Soon
                </span>
              )}
              {selectedMode === mode.id && mode.enabled && (
                <span className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                  <svg
                    className="w-3 h-3 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>
            <p className="text-sm text-gray-600">{mode.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
