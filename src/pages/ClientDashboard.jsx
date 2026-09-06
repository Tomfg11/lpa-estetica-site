import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import QRCode from 'react-qr-code';
import { useAuth } from '../hooks/useAuth';
import useFidelityPoints from '../hooks/useFidelityPoints';
import { getClientProcedures, toDateObject } from '../services/procedureService';
import FidelityCard from '../components/ui/FidelityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import logo from '../assets/logo-lpa.png';

/**
 * ClientDashboard — Painel da cliente com cartão fidelidade, QR Code e previsão de manutenção.
 */
const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, userData, logout, loading: authLoading } = useAuth();
  const { points, maxPoints, loading: pointsLoading, isCardComplete } = useFidelityPoints(user?.uid);
  const [latestProcedure, setLatestProcedure] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      getClientProcedures(user.uid)
        .then((procs) => {
          if (procs && procs.length > 0) {
            setLatestProcedure(procs[0]);
          }
        })
        .catch((err) => console.log('Histórico não disponível para visualização cliente:', err));
    }
  }, [user?.uid]);

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

  const dueDateFormatted = latestProcedure
    ? toDateObject(latestProcedure.dueDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
      })
    : null;

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
      <div className="flex-1 flex flex-col items-center px-5 py-6 gap-5 max-w-md mx-auto w-full">
        {/* Saudação */}
        <div className="text-center">
          <h1 className="font-serif text-xl sm:text-2xl text-brand-primary font-bold">
            Olá, {userData?.name || 'Cliente'}! 👋
          </h1>
          <p className="text-brand-text text-xs mt-1">
            {userData?.phoneNumber || user?.phoneNumber}
          </p>
        </div>

        {/* Cartão Fidelidade */}
        <FidelityCard currentPoints={points} maxPoints={maxPoints} />

        {/* Mensagem de status de pontos */}
        {isCardComplete ? (
          <div className="w-full bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-4 text-center">
            <p className="text-amber-800 font-bold text-sm">🎉 Parabéns!</p>
            <p className="text-amber-700 text-xs mt-1">
              Seu cartão está completo! Apresente este QR Code para resgatar sua recompensa.
            </p>
          </div>
        ) : (
          <div className="w-full bg-white/60 backdrop-blur-sm rounded-xl p-3 text-center">
            <p className="text-brand-text text-xs leading-relaxed">
              Falta{points === maxPoints - 1 ? '' : 'm'}{' '}
              <span className="font-bold text-brand-primary">{maxPoints - points}</span>{' '}
              {maxPoints - points === 1 ? 'marcação' : 'marcações'} para completar seu cartão!
            </p>
          </div>
        )}

        {/* Card de Lembrete / Previsão de Próxima Manutenção */}
        {latestProcedure && dueDateFormatted && (
          <div className="w-full bg-gradient-to-r from-brand-light to-brand-peach/40 border border-brand-accent/30 rounded-2xl p-4 shadow-sm text-left">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-base">✨</span>
              <p className="text-brand-primary font-bold text-xs uppercase tracking-wider">
                Próxima Manutenção Recomendada
              </p>
            </div>
            <p className="text-brand-text text-xs leading-relaxed">
              Para seu <strong>{latestProcedure.serviceName}</strong> continuar impecável, a data
              sugerida de retorno é até <strong>{dueDateFormatted}</strong>.
            </p>
            <a
              href={`https://wa.me/5521978890411?text=${encodeURIComponent(
                `Olá Letícia! Gostaria de agendar a manutenção do meu ${latestProcedure.serviceName} 🥰`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-md hover:bg-brand-secondary transition-all"
            >
              <span>💬</span>
              <span>Agendar Manutenção pelo WhatsApp</span>
            </a>
          </div>
        )}

        {/* QR Code */}
        <div className="w-full bg-white rounded-2xl shadow-lg shadow-brand-primary/5 p-6 flex flex-col items-center">
          <h2 className="font-serif text-lg text-brand-primary font-bold mb-1">Seu QR Code</h2>
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
          className="text-brand-text text-xs hover:text-brand-primary transition-colors py-2"
        >
          ← Voltar ao site
        </Link>
      </div>
    </div>
  );
};

export default ClientDashboard;
