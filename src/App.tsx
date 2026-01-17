
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './components';
import { TelepartyProvider } from './contexts/TelepartyContext';
import RoomPage from './pages/RoomPage';

function App() {
  return (
    <BrowserRouter basename="/TelepartyChallenge2026">
      <TelepartyProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/room/:roomId" element={<RoomPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </TelepartyProvider>
    </BrowserRouter>
  );
}

export default App;
