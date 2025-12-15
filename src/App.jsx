import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import HomePage from './pages/HomePage';
import CreatePersonaPage from './pages/CreatePersonaPage';
import ResultsPage from './pages/ResultsPage';
import ChatPage from './pages/ChatPage';
import PersonasPage from './pages/PersonasPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePersonaPage />} />
        <Route path="/personas" element={<PersonasPage />} />
        <Route path="/persona/:id/results" element={<ResultsPage />} />
        <Route path="/persona/:id/chat" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
