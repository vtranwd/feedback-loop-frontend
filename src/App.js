import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import EnvironmentalDashboard from './pages/EnvironmentalDashboard';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/environmental" element={<EnvironmentalDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;