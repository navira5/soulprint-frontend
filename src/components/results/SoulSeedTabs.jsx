import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SoulSeedTabs({ soulSeedData }) {
  const [activeTab, setActiveTab] = useState('identity');

  const tabs = [
    { id: 'identity', label: 'Identity Blueprint', key: '7_dimensions' },
    { id: 'linguistic', label: 'Linguistic Fingerprint', key: 'linguistic' },
    { id: 'stability', label: 'Stability Layer', key: 'stability_layer' },
    { id: 'continuity', label: 'Continuity Profile', key: 'continuity_profile' },
  ];

  const renderContent = () => {
    const currentTab = tabs.find((t) => t.id === activeTab);
    const data = soulSeedData?.[currentTab.key];

    if (!data) {
      return (
        <div className="text-center py-12 text-gray-500">
          No data available for this section
        </div>
      );
    }

    // If it's a string (like personality_synthesis), render as markdown
    if (typeof data === 'string') {
      return (
        <div className="prose max-w-none">
          <ReactMarkdown>{data}</ReactMarkdown>
        </div>
      );
    }

    // If it's an object, render the properties
    return (
      <div className="space-y-6">
        {Object.entries(data).map(([key, value]) => {
          // Format the key to be more readable
          const formattedKey = key
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

          return (
            <div key={key} className="border-b border-gray-200 pb-4 last:border-0">
              <h4 className="font-semibold text-gray-900 mb-2">{formattedKey}</h4>
              {typeof value === 'string' ? (
                <div className="prose max-w-none text-gray-700">
                  <ReactMarkdown>{value}</ReactMarkdown>
                </div>
              ) : typeof value === 'object' && value !== null ? (
                <pre className="text-sm text-gray-700 bg-gray-50 p-4 rounded overflow-x-auto">
                  {JSON.stringify(value, null, 2)}
                </pre>
              ) : (
                <p className="text-gray-700">{String(value)}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex -mb-px overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-shrink-0 px-6 py-4 text-sm font-medium border-b-2 transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">{renderContent()}</div>
    </div>
  );
}
