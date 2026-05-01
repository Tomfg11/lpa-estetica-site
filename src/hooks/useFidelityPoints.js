import { useState, useEffect } from 'react';
import { subscribeToUserData, getMaxPoints } from '../services/fidelityService';

/**
 * useFidelityPoints — Hook para gerenciar estado de pontos em tempo real.
 * Escuta mudanças no Firestore via onSnapshot para atualização instantânea.
 * 
 * @param {string|null} userId - UID do usuário (null = não busca)
 * @returns {{ points, maxPoints, loading, error, userData }}
 */
const useFidelityPoints = (userId) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const maxPoints = getMaxPoints();

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToUserData(userId, (data) => {
      setUserData(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userId]);

  return {
    points: userData?.points ?? 0,
    maxPoints,
    loading,
    error,
    userData,
    isCardComplete: (userData?.points ?? 0) >= maxPoints,
  };
};

export default useFidelityPoints;
