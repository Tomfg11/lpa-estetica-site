import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

/**
 * ProtectedRoute — Guard para rotas administrativas.
 * 
 * Validações:
 * 1. Se ainda carregando → mostra spinner
 * 2. Se não autenticado → redireciona para /login-admin
 * 3. Se autenticado, mas email ≠ VITE_ADMIN_EMAIL → redireciona para /
 * 4. Se tudo OK → renderiza children
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading, isAdmin } = useAuth();

  // Ainda verificando estado de auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary border-t-transparent"></div>
          <p className="text-brand-text text-sm">Verificando acesso...</p>
        </div>
      </div>
    );
  }

  // Não autenticado → login
  if (!user) {
    return <Navigate to="/login-admin" replace />;
  }

  // Autenticado, mas não é admin → volta para landing page
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Tudo OK → renderiza a rota protegida
  return children;
};

export default ProtectedRoute;
