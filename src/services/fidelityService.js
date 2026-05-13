import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  increment,
  serverTimestamp,
  onSnapshot,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * fidelityService — Camada de abstração para operações de fidelidade.
 * Segue SRP: só cuida de pontos e histórico.
 * Nenhum componente React deve chamar o Firestore diretamente.
 */

const MAX_POINTS = 10;

// ============================================================
// LEITURA
// ============================================================

/**
 * Busca os dados de fidelidade de um usuário.
 * @param {string} userId - UID do Firebase Auth
 * @returns {Promise<{points: number, phoneNumber: string, ...}>}
 */
export const getUserData = async (userId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado.');
  }

  return { id: userDoc.id, ...userDoc.data() };
};

/**
 * Escuta mudanças nos dados de um usuário em tempo real.
 * Usado no dashboard da cliente para atualização instantânea.
 * @param {string} userId - UID do Firebase Auth
 * @param {function} callback - Função chamada com os dados atualizados
 * @returns {function} Função para cancelar o listener
 */
export const subscribeToUserData = (userId, callback) => {
  const userDocRef = doc(db, 'users', userId);

  return onSnapshot(userDocRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() });
    }
  });
};

// ============================================================
// ESCRITA (Somente Admin)
// ============================================================

/**
 * Adiciona +1 ponto ao cartão fidelidade da cliente.
 * @param {string} userId - UID da cliente
 * @param {string} adminId - UID da administradora (para auditoria)
 * @returns {Promise<{newPoints: number, isCardComplete: boolean}>}
 */
export const addPoint = async (userId, adminId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado.');
  }

  const currentPoints = userDoc.data().points || 0;

  if (currentPoints >= MAX_POINTS) {
    throw new Error('Cartão já completo! Resgate a recompensa antes de adicionar pontos.');
  }

  const newPoints = currentPoints + 1;

  // Atualiza pontos no documento principal
  await updateDoc(userDocRef, {
    points: increment(1),
    lastPointAt: serverTimestamp(),
  });

  // Registra no histórico (subcollection)
  await addDoc(collection(db, 'users', userId, 'history'), {
    type: 'point_added',
    addedBy: adminId,
    addedAt: serverTimestamp(),
    pointsBefore: currentPoints,
    pointsAfter: newPoints,
  });

  return {
    newPoints,
    isCardComplete: newPoints >= MAX_POINTS,
  };
};

/**
 * Resgata a recompensa e zera o cartão fidelidade.
 * Só pode ser chamado quando a cliente tem 10 pontos.
 * @param {string} userId - UID da cliente
 * @param {string} adminId - UID da administradora
 * @returns {Promise<void>}
 */
export const redeemReward = async (userId, adminId) => {
  const userDocRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error('Usuário não encontrado.');
  }

  const currentPoints = userDoc.data().points || 0;

  if (currentPoints < MAX_POINTS) {
    throw new Error(`Cartão incompleto. A cliente tem ${currentPoints}/${MAX_POINTS} pontos.`);
  }

  // Zera os pontos
  await updateDoc(userDocRef, {
    points: 0,
    lastRedeemAt: serverTimestamp(),
  });

  // Registra o resgate no histórico
  await addDoc(collection(db, 'users', userId, 'history'), {
    type: 'reward_redeemed',
    redeemedBy: adminId,
    redeemedAt: serverTimestamp(),
    pointsAtRedemption: currentPoints,
  });
};

/**
 * Busca todos os clientes cadastrados (Apenas para Admin).
 * @returns {Promise<Array>} Lista de clientes
 */
export const getAllClients = async () => {
  const q = query(
    collection(db, 'users'),
    where('role', '==', 'client'),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};

/**
 * Retorna o número máximo de pontos do cartão.
 * @returns {number}
 */
export const getMaxPoints = () => MAX_POINTS;
