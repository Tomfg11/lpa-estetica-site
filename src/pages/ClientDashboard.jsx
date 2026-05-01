import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useAuth } from '../hooks/useAuth';
import useFidelityPoints from '../hooks/useFidelityPoints';
import FidelityCard from '../components/ui/FidelityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import logo from '../assets/logo-lpa.png';

/**
 * ClientDashboard — Painel da cliente com cartão fidelidade e QR Code.
 * Design mobile-first: pensado para uso no celular.
 */
const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, userData, logout, loading: authLoading } = useAuth();
  const { points, maxPoints, loading: pointsLoading, isCardComplete } = useFidelityPoints(user?.uid);

  const handleLogout = async () => {
    await logout();
    navigate('/fidelidade', { replace: true });
  };

  // Loading
  if (authLoading || pointsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
        <LoadingSpinner size="lg" message="Carregando seu cartão..." />
      </div>
    );
  }

  // Não autenticado
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hero-gradient px-5">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <span className="text-4xl mb-4 block">🔒</span>
          <h1 className="font-serif text-2xl text-brand-primary mb-3">Acesso Necessário</h1>
          <p className="text-brand-text text-sm mb-6">Faça login para ver seu cartão fidelidade.</p>
          <Link
            to="/fidelidade"
            className="inline-block w-full py-3 rounded-xl bg-brand-primary text-white font-bold text-sm shadow-lg"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Header */}
      <div className="pt-6 px-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LPA" className="h-10 w-10 rounded-full" />
          <span className="font-serif text-brand-primary font-bold text-lg">LPA</span>
        </Link>
        <button
          onClick={handleLogout}
          className="text-brand-text text-sm hover:text-red-500 transition-colors flex items-center gap-1"
        >
          Sair →
        </button>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-6 max-w-md mx-auto w-full">

        {/* Saudação */}
        <div className="text-center">
          <h1 className="font-serif text-xl sm:text-2xl text-brand-primary font-bold">
            Olá, {userData?.name || 'Cliente'}! 👋
          </h1>
          <p className="text-brand-text text-sm mt-1">
            {userData?.phoneNumber || user?.phoneNumber}
          </p>
        </div>

        {/* Cartão Fidelidade */}
        <FidelityCard currentPoints={points} maxPoints={maxPoints} />

        {/* Mensagem de status */}
        {isCardComplete ? (
          <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-bold text-sm">🎉 Parabéns!</p>
            <p className="text-amber-700 text-xs mt-1">
              Seu cartão está completo! Apresente este QR Code para resgatar sua recompensa.
            </p>
          </div>
        ) : (
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl p-4 text-center">
            <p className="text-brand-text text-xs leading-relaxed">
              Falta{points === maxPoints - 1 ? '' : 'm'} <span className="font-bold text-brand-primary">{maxPoints - points}</span>{' '}
              {maxPoints - points === 1 ? 'marcação' : 'marcações'} para completar seu cartão!
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="w-full bg-white rounded-2xl shadow-lg shadow-brand-primary/5 p-6 flex flex-col items-center">
          <h2 className="font-serif text-lg text-brand-primary font-bold mb-1">
            Seu QR Code
          </h2>
          <p className="text-brand-text text-xs mb-5 text-center">
            Apresente este código ao realizar um serviço
          </p>

          <div className="bg-white p-3 rounded-xl border-2 border-brand-light">
            <QRCode
              value={user.uid}
              size={180}
              level="H"
              fgColor="#7A2E39"
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
              viewBox="0 0 256 256"
            />
          </div>

          <p className="text-brand-text/40 text-[10px] mt-3 font-mono">
            ID: {user.uid.slice(0, 12)}...
          </p>
        </div>

        {/* Link para voltar */}
        <Link
          to="/"
          className="text-brand-text text-sm hover:text-brand-primary transition-colors py-3"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
};

export default ClientDashboard;
