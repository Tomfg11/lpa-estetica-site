import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from '../config/firebase';

/**
 * authService — Camada de abstração para autenticação Firebase.
 * Segue o Single Responsibility Principle: só cuida de auth.
 * Nenhum componente React deve chamar o Firebase diretamente.
 */

// ============================================================
// PHONE AUTH (Clientes)
// ============================================================

/**
 * Configura o reCAPTCHA invisível necessário para Phone Auth.
 * Deve ser chamado ANTES de loginWithPhone().
 * @param {string} buttonId - ID do botão que dispara o envio do SMS
 * @returns {RecaptchaVerifier}
 */
export const setupRecaptcha = (buttonId) => {
  // Limpa instância anterior se existir (evita erro de duplicação)
  if (window.recaptchaVerifier) {
    window.recaptchaVerifier.clear();
    window.recaptchaVerifier = null;
  }

  const verifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA resolvido — permite envio do SMS
    },
    'expired-callback': () => {
      // reCAPTCHA expirou — o usuário precisa tentar novamente
      console.warn('reCAPTCHA expirou. Tente novamente.');
    },
  });

  window.recaptchaVerifier = verifier;
  return verifier;
};

/**
 * Envia SMS com código OTP para o número de telefone.
 * @param {string} phoneNumber - Número com código do país (ex: +5521978890411)
 * @returns {Promise<ConfirmationResult>}
 */
export const loginWithPhone = async (phoneNumber) => {
  const appVerifier = window.recaptchaVerifier;
  if (!appVerifier) {
    throw new Error('reCAPTCHA não configurado. Chame setupRecaptcha() primeiro.');
  }

  const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
  return confirmationResult;
};

/**
 * Verifica o código OTP e autentica o usuário.
 * @param {object} confirmationResult - Objeto de confirmação do Firebase
 * @param {string} code - Código OTP de 6 dígitos
 * @returns {Promise<{user: User, isNewUser: boolean}>}
 */
export const verifyOTP = async (confirmationResult, code) => {
  const result = await confirmationResult.confirm(code);
  const user = result.user;

  // Verifica se o usuário já existe no Firestore para decidir o fluxo da UI
  const userDocRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userDocRef);

  return { 
    user, 
    isNewUser: !userDoc.exists() 
  };
};

/**
 * Cria o documento inicial do cliente no Firestore (Primeiro acesso).
 * @param {User} user - Objeto do usuário autenticado
 * @param {string} name - Nome fornecido pela cliente
 */
export const completeRegistration = async (user, name) => {
  const userDocRef = doc(db, 'users', user.uid);
  
  await setDoc(userDocRef, {
    uid: user.uid,
    phoneNumber: user.phoneNumber,
    name: name,
    role: 'client',
    points: 0,
    createdAt: serverTimestamp(),
  });
};

// ============================================================
// EMAIL/PASSWORD AUTH (Admin)
// ============================================================

/**
 * Login da administradora com email e senha.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
export const loginAdminWithEmail = async (email, password) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
};

// ============================================================
// UTILITÁRIOS
// ============================================================

/**
 * Faz logout do usuário atual.
 */
export const logout = async () => {
  await signOut(auth);
};

/**
 * Busca os dados do usuário no Firestore.
 * @param {string} userId - UID do Firebase Auth
 * @returns {Promise<Object|null>}
 */
export const getUserDocument = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (userDoc.exists()) {
    return { id: userDoc.id, ...userDoc.data() };
  }

  return null;
};

/**
 * Escuta mudanças no estado de autenticação.
 * @param {function} callback - Função chamada quando o estado muda
 * @returns {function} Função para cancelar o listener
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};
