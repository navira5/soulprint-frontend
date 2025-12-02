import { Link } from 'react-router-dom';

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
            <Link to="/create" className="hover:text-primary-100 transition">Create Persona</Link>
            <Link to="/personas" className="hover:text-primary-100 transition">Personas</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
