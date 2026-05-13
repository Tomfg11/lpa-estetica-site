import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import LandingPage from './pages/LandingPage';
import ClientLoginPage from './pages/ClientLoginPage';
import ClientDashboard from './pages/ClientDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/guards/ProtectedRoute';

function App() {
  return (
    <>
      <Analytics />
      <Routes>
        {/* Landing Page original */}
        <Route path="/" element={<LandingPage />} />

        {/* Área da Cliente */}
        <Route path="/fidelidade" element={<ClientLoginPage />} />
        <Route path="/meu-cartao" element={<ClientDashboard />} />

        {/* Área da Administradora */}
        <Route path="/login-admin" element={<AdminLoginPage />} />
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </>
  );
}

export default App;