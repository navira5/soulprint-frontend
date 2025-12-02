import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { usePersonaStore } from '../store/personaStore';
import LoadingSpinner from '../components/shared/LoadingSpinner';

export default function PersonasPage() {
  const navigate = useNavigate();
  const { personas, loading, fetchPersonas } = usePersonaStore();

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Personas</h1>
          <button
            onClick={() => navigate('/create')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create New Persona</span>
          </button>
        </div>

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
                onClick={() => navigate(`/persona/${persona.persona_id}/chat`)}
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
