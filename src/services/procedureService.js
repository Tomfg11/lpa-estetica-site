import {
  collection,
  doc,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { addPoint } from './fidelityService';
import { getWhatsAppMessage } from '../data/procedureDefaults';

/**
 * Converte data (Timestamp do Firestore, Date ou string) para objeto Date JS
 */
export const toDateObject = (dateValue) => {
  if (!dateValue) return new Date();
  if (dateValue instanceof Date) return dateValue;
  if (typeof dateValue.toDate === 'function') return dateValue.toDate();
  if (typeof dateValue === 'string' || typeof dateValue === 'number') return new Date(dateValue);
  return new Date();
};

/**
 * Calcula a diferença em dias corridos entre duas datas
 */
export const getDaysDifference = (fromDate, toDate = new Date()) => {
  const d1 = new Date(fromDate);
  d1.setHours(0, 0, 0, 0);
  const d2 = new Date(toDate);
  d2.setHours(0, 0, 0, 0);
  const diffTime = d2.getTime() - d1.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Determina o status temporal de um procedimento
 * @param {Date|Timestamp} performedAt 
 * @param {Date|Timestamp} dueDate 
 * @param {string} currentStatus 'pending' | 'contacted' | 'completed' | 'cancelled'
 */
export const getProcedureStatusInfo = (performedAt, dueDate, currentStatus = 'pending') => {
  const performed = toDateObject(performedAt);
  const due = toDateObject(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysAgo = getDaysDifference(performed, new Date());
  const dueMidnight = new Date(due);
  dueMidnight.setHours(0, 0, 0, 0);

  const daysToDue = Math.round((dueMidnight.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (currentStatus === 'contacted') {
    return {
      type: 'contacted',
      label: 'Mensagem Enviada',
      badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
      daysAgo,
      daysToDue,
      isUrgent: false,
    };
  }

  if (currentStatus === 'completed') {
    return {
      type: 'completed',
      label: 'Retorno Concluído',
      badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
      daysAgo,
      daysToDue,
      isUrgent: false,
    };
  }

  if (daysToDue < 0) {
    const overdueDays = Math.abs(daysToDue);
    return {
      type: 'overdue',
      label: overdueDays === 1 ? 'Atrasado 1 dia' : `Atrasado ${overdueDays} dias`,
      badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-400/40 animate-pulse',
      daysAgo,
      daysToDue,
      isUrgent: true,
    };
  }

  if (daysToDue === 0) {
    return {
      type: 'today',
      label: 'Retorno Hoje! ✨',
      badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-400/40 font-bold',
      daysAgo,
      daysToDue,
      isUrgent: true,
    };
  }

  if (daysToDue <= 7) {
    return {
      type: 'upcoming',
      label: daysToDue === 1 ? 'Amanhã' : `Em ${daysToDue} dias`,
      badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-400/40',
      daysAgo,
      daysToDue,
      isUrgent: false,
    };
  }

  return {
    type: 'future',
    label: `Em ${daysToDue} dias`,
    badgeClass: 'bg-white/10 text-white/70 border-white/20',
    daysAgo,
    daysToDue,
    isUrgent: false,
  };
};

/**
 * Registra um procedimento/atendimento no Firestore
 */
export const createProcedure = async ({
  clientId,
  clientName,
  clientPhone,
  category,
  serviceName,
  performedAt = new Date(),
  maintenanceDays = 20,
  price = null,
  paymentMethod = 'pix',
  notes = '',
  addFidelityPoint = false,
  adminId,
}) => {
  if (!clientId || !serviceName) {
    throw new Error('Cliente e Procedimento são obrigatórios.');
  }

  const perfDate = toDateObject(performedAt);
  const due = new Date(perfDate);
  due.setDate(due.getDate() + Number(maintenanceDays));

  // Opcionalmente adiciona ponto no cartão fidelidade
  let pointResult = null;
  if (addFidelityPoint && adminId) {
    try {
      pointResult = await addPoint(clientId, adminId);
    } catch (err) {
      console.warn('Não foi possível adicionar ponto fidelidade automático:', err.message);
    }
  }

  const procedureData = {
    clientId,
    clientName: clientName || 'Cliente',
    clientPhone: clientPhone || '',
    category: category || 'Outro',
    serviceName: serviceName.trim(),
    price: typeof price === 'number' ? price : Number(price) || 0,
    paymentMethod: paymentMethod || 'pix',
    performedAt: Timestamp.fromDate(perfDate),
    maintenanceDays: Number(maintenanceDays),
    dueDate: Timestamp.fromDate(due),
    notes: notes.trim(),
    status: 'pending', // 'pending' | 'contacted' | 'completed' | 'cancelled'
    createdAt: serverTimestamp(),
    createdBy: adminId || 'admin',
    lastContactedAt: null,
  };

  const docRef = await addDoc(collection(db, 'procedures'), procedureData);

  return {
    id: docRef.id,
    ...procedureData,
    pointResult,
  };
};

/**
 * Busca todos os procedimentos para acompanhamento
 */
export const getAllProcedures = async () => {
  const querySnapshot = await getDocs(collection(db, 'procedures'));

  const items = querySnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return items.sort((a, b) => toDateObject(a.dueDate) - toDateObject(b.dueDate));
};

/**
 * Busca histórico de procedimentos de uma cliente específica
 */
export const getClientProcedures = async (clientId) => {
  if (!clientId) return [];
  const q = query(
    collection(db, 'procedures'),
    where('clientId', '==', clientId)
  );

  const querySnapshot = await getDocs(q);
  const items = querySnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return items.sort((a, b) => toDateObject(b.performedAt) - toDateObject(a.performedAt));
};

/**
 * Atualiza o status do procedimento (ex: marcar como contatada)
 */
export const updateProcedureStatus = async (procedureId, newStatus, contactNotes = '') => {
  const docRef = doc(db, 'procedures', procedureId);
  const updatePayload = {
    status: newStatus,
    updatedAt: serverTimestamp(),
  };

  if (newStatus === 'contacted') {
    updatePayload.lastContactedAt = serverTimestamp();
  }

  if (contactNotes) {
    updatePayload.contactNotes = contactNotes;
  }

  await updateDoc(docRef, updatePayload);
};

/**
 * Adia a data de retorno em X dias (ex: cliente pediu para ligar semana que vem)
 */
export const postponeProcedureDueDate = async (procedureId, currentDueDate, daysToAdd = 7) => {
  const docRef = doc(db, 'procedures', procedureId);
  const baseDate = toDateObject(currentDueDate);
  const newDue = new Date(baseDate);
  newDue.setDate(newDue.getDate() + Number(daysToAdd));

  await updateDoc(docRef, {
    dueDate: Timestamp.fromDate(newDue),
    status: 'pending',
    updatedAt: serverTimestamp(),
  });
};

/**
 * Remove um procedimento
 */
export const deleteProcedure = async (procedureId) => {
  const docRef = doc(db, 'procedures', procedureId);
  await deleteDoc(docRef);
};

/**
 * Gera a URL do WhatsApp com a mensagem pré-formatada
 */
export const buildWhatsAppUrl = (phone, text) => {
  if (!phone) return '#';
  const cleanNumber = phone.replace(/\D/g, '');
  const formattedNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${formattedNumber}?text=${encodedText}`;
};

/**
 * Cria a mensagem completa para o procedimento
 */
export const getFormattedMessageForProcedure = (procedure) => {
  const performedDate = toDateObject(procedure.performedAt);
  const daysAgo = getDaysDifference(performedDate, new Date());
  return getWhatsAppMessage(
    procedure.category,
    procedure.clientName,
    procedure.serviceName,
    daysAgo > 0 ? daysAgo : procedure.maintenanceDays
  );
};
