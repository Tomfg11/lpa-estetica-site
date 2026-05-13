import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import {
  onAuthChange,
  getUserDocument,
  loginWithPhone as phoneLogin,
  verifyOTP as verifyOTPService,
  loginAdminWithEmail as adminLogin,
  logout as logoutService,
  setupRecaptcha as setupRecaptchaService,
  completeRegistration as completeRegistrationService,
} from '../services/authService';

const AuthContext = createContext(null);

/**
 * AuthProvider — Provedor de contexto de autenticação.
 * Gerencia o estado global do usuário logado (Firebase Auth + Firestore).
 * Expõe funções para login/logout via services (nunca acessa Firebase diretamente).
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);          // Firebase Auth user
  const [userData, setUserData] = useState(null);   // Firestore document
  const [loading, setLoading] = useState(true);     // Carregamento inicial

  // Escuta mudanças no estado de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          // Busca dados complementares do Firestore
          const doc = await getUserDocument(firebaseUser.uid);
          setUserData(doc);
        } catch (error) {
          console.error('Erro ao buscar dados do usuário:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ============================================================
  // FUNÇÕES EXPOSTAS PELO CONTEXTO
  // ============================================================

  /**
   * Configura o reCAPTCHA para Phone Auth.
   */
  const setupRecaptcha = useCallback((buttonId) => {
    return setupRecaptchaService(buttonId);
  }, []);

  /**
   * Envia código OTP por SMS.
   */
  const loginWithPhone = useCallback(async (phoneNumber) => {
    return await phoneLogin(phoneNumber);
  }, []);

  /**
   * Verifica o código OTP e autentica a cliente.
   */
  const verifyOTP = useCallback(async (confirmationResult, code) => {
    const result = await verifyOTPService(confirmationResult, code);
    // Se não for novo usuário, já busca o doc. Se for novo, deixamos para o completeRegistration
    if (!result.isNewUser) {
      const doc = await getUserDocument(result.user.uid);
      setUserData(doc);
    }
    return result;
  }, []);

  /**
   * Finaliza o cadastro com o nome.
   */
  const completeRegistration = useCallback(async (authUser, name) => {
    await completeRegistrationService(authUser, name);
    const doc = await getUserDocument(authUser.uid);
    setUserData(doc);
  }, []);

  /**
   * Login da administradora com email e senha.
   */
  const loginAdmin = useCallback(async (email, password) => {
    const authUser = await adminLogin(email, password);
    const doc = await getUserDocument(authUser.uid);
    setUserData(doc);
    return authUser;
  }, []);

  /**
   * Logout (funciona para ambos os tipos de usuário).
   */
  const logout = useCallback(async () => {
    await logoutService();
    setUser(null);
    setUserData(null);
  }, []);

  /**
   * Verifica se o usuário logado é a administradora.
   */
  const isAdmin = user?.email === import.meta.env.VITE_ADMIN_EMAIL;

  const value = {
    user,
    userData,
    loading,
    isAdmin,
    setupRecaptcha,
    loginWithPhone,
    verifyOTP,
    completeRegistration,
    loginAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de autenticação.
 * Garante que está sendo usado dentro do AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export default AuthContext;
