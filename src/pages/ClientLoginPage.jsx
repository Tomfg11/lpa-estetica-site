import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import logo from '../assets/logo-lpa.png';

/**
 * ClientLoginPage — Login da cliente por telefone com OTP SMS.
 * Design mobile-first.
 * 
 * Fluxo UX Melhorado:
 * 1. Step 'phone': Apenas Telefone.
 * 2. Step 'otp': Apenas Código.
 * 3. Step 'welcome': Apenas se for NOVO usuário (pede o nome).
 */
const ClientLoginPage = () => {
  const navigate = useNavigate();
  const { user, userData, setupRecaptcha, loginWithPhone, verifyOTP, completeRegistration, loading: authLoading } = useAuth();

  const [step, setStep] = useState('phone'); // 'phone' | 'otp' | 'welcome'
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [tempAuthUser, setTempAuthUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Se já logado e com dados completos, vai para dashboard
  useEffect(() => {
    if (!authLoading && user && userData?.name) {
      navigate('/meu-cartao', { replace: true });
    }
  }, [user, userData, authLoading, navigate]);

  const formatPhone = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) return digits.length ? `(${digits}` : '';
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const handlePhoneChange = (e) => {
    setPhone(formatPhone(e.target.value));
    setError('');
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 11) {
      setError('Digite um número válido com DDD.');
      return;
    }
    setLoading(true);
    try {
      setupRecaptcha('send-otp-btn');
      const result = await loginWithPhone(`+55${digits}`);
      setConfirmationResult(result);
      setStep('otp');
    } catch (err) {
      console.error(err);
      setError('Erro ao enviar SMS. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) return;
    setLoading(true);
    try {
      const { user: authUser, isNewUser } = await verifyOTP(confirmationResult, otp);
      
      if (isNewUser) {
        setTempAuthUser(authUser);
        setStep('welcome'); // Novo usuário -> pede nome
      } else {
        navigate('/meu-cartao', { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError('Código incorreto ou expirado.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishSignup = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    try {
      await completeRegistration(tempAuthUser, name);
      navigate('/meu-cartao', { replace: true });
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-hero-gradient">
      <LoadingSpinner size="lg" message="Carregando..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      <div className="pt-6 px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="LPA" className="h-10 w-10 rounded-full" />
          <span className="font-serif text-brand-primary font-bold text-lg">LPA</span>
        </Link>
        <Link to="/" className="text-brand-text text-sm">← Voltar</Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-5 py-8">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
              <span className="text-3xl">{step === 'welcome' ? '✨' : '💳'}</span>
            </div>
            <h1 className="font-serif text-2xl text-brand-primary font-bold">
              {step === 'welcome' ? 'Seja bem-vinda!' : 'Cartão Fidelidade'}
            </h1>
            <p className="text-brand-text text-sm mt-2">
              {step === 'phone' && 'Digite seu número para começar'}
              {step === 'otp' && 'Digite o código enviado por SMS'}
              {step === 'welcome' && 'Como podemos te chamar?'}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            {step === 'phone' && (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-brand-text uppercase mb-2">Telefone com DDD</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="(21) 99999-9999"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-accent outline-none text-center text-lg font-medium"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button id="send-otp-btn" type="submit" disabled={loading || phone.replace(/\D/g, '').length !== 11} className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold shadow-lg flex items-center justify-center gap-2">
                  {loading ? <LoadingSpinner size="sm" /> : '📱 Receber Código'}
                </button>
              </form>
            )}

            {step === 'otp' && (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center">
                  <p className="text-brand-primary font-bold text-sm">{phone}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-brand-text uppercase mb-2">Código de 6 dígitos</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-accent outline-none text-2xl text-center tracking-[0.5em] font-bold"
                    autoFocus
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading || otp.length !== 6} className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold shadow-lg flex items-center justify-center gap-2">
                  {loading ? <LoadingSpinner size="sm" /> : '✅ Verificar'}
                </button>
                <button type="button" onClick={() => setStep('phone')} className="w-full text-brand-text text-sm py-2">← Alterar número</button>
              </form>
            )}

            {step === 'welcome' && (
              <form onSubmit={handleFinishSignup} className="space-y-5">
                <div>
                  <label className="block text-xs font-medium text-brand-text uppercase mb-2">Seu Nome Completo</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:border-brand-accent outline-none font-medium"
                    autoFocus
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">{error}</p>}
                <button type="submit" disabled={loading || !name.trim()} className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold shadow-lg flex items-center justify-center gap-2">
                  {loading ? <LoadingSpinner size="sm" /> : '✨ Concluir Cadastro'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <div id="recaptcha-container"></div>
    </div>
  );
};

export default ClientLoginPage;
