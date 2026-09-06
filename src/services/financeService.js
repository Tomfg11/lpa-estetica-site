import {
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { toDateObject } from './procedureService';
import { getDefaultPriceForService } from '../data/procedureDefaults';

/**
 * Cria um registro de despesa no Firestore
 */
export const createExpense = async ({
  description,
  amount,
  category = 'Materiais',
  date = new Date(),
  adminId,
}) => {
  if (!description || !amount) {
    throw new Error('Descrição e valor são obrigatórios.');
  }

  const expDate = toDateObject(date);
  const expenseData = {
    description: description.trim(),
    amount: Number(amount) || 0,
    category: category || 'Outro',
    date: Timestamp.fromDate(expDate),
    createdAt: serverTimestamp(),
    createdBy: adminId || 'admin',
  };

  const docRef = await addDoc(collection(db, 'expenses'), expenseData);
  return { id: docRef.id, ...expenseData };
};

/**
 * Busca todas as despesas do Firestore
 */
export const getAllExpenses = async () => {
  const querySnapshot = await getDocs(collection(db, 'expenses'));
  const items = querySnapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

  return items.sort((a, b) => toDateObject(b.date) - toDateObject(a.date));
};

/**
 * Exclui uma despesa
 */
export const deleteExpense = async (expenseId) => {
  const docRef = doc(db, 'expenses', expenseId);
  await deleteDoc(docRef);
};

/**
 * Salva e lê a meta mensal do estúdio
 */
export const saveMonthlyGoal = (yearMonth, amount) => {
  try {
    localStorage.setItem(`lpa_goal_${yearMonth}`, String(amount));
  } catch (err) {
    console.error('Erro ao salvar meta:', err);
  }
};

export const getMonthlyGoal = (yearMonth) => {
  try {
    const saved = localStorage.getItem(`lpa_goal_${yearMonth}`);
    return saved ? Number(saved) : 5000; // Padrão R$ 5.000
  } catch {
    return 5000;
  }
};

/**
 * Calcula todas as métricas financeiras do mês selecionado
 * @param {Array} procedures - Lista de todos os procedimentos
 * @param {Array} expenses - Lista de todas as despesas
 * @param {number} targetYear - Ano selecionado (ex: 2026)
 * @param {number} targetMonth - Mês selecionado (0 a 11)
 * @param {number} goal - Meta em R$
 */
export const calculateFinanceMetrics = (
  procedures = [],
  expenses = [],
  targetYear,
  targetMonth,
  goal = 5000
) => {
  // 1. Filtra procedimentos realizados no mês
  const monthlyProcedures = procedures.filter((p) => {
    const d = toDateObject(p.performedAt);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // 2. Filtra despesas do mês
  const monthlyExpenses = expenses.filter((e) => {
    const d = toDateObject(e.date);
    return d.getFullYear() === targetYear && d.getMonth() === targetMonth;
  });

  // 3. Faturamento Bruto
  let totalRevenue = 0;
  const paymentBreakdown = {
    pix: { label: 'Pix', total: 0, count: 0, icon: '⚡' },
    credit: { label: 'Crédito', total: 0, count: 0, icon: '💳' },
    debit: { label: 'Débito', total: 0, count: 0, icon: '💳' },
    cash: { label: 'Dinheiro', total: 0, count: 0, icon: '💵' },
    other: { label: 'Outro', total: 0, count: 0, icon: '💰' },
  };

  const serviceRankingMap = {};

  monthlyProcedures.forEach((p) => {
    const price = typeof p.price === 'number' && p.price > 0
      ? p.price
      : getDefaultPriceForService(p.serviceName);

    totalRevenue += price;

    // Forma de pagamento
    const method = p.paymentMethod && paymentBreakdown[p.paymentMethod]
      ? p.paymentMethod
      : 'pix'; // padrão Pix se não informado

    paymentBreakdown[method].total += price;
    paymentBreakdown[method].count += 1;

    // Ranking de serviços
    const sName = p.serviceName || 'Outro Serviço';
    if (!serviceRankingMap[sName]) {
      serviceRankingMap[sName] = {
        name: sName,
        category: p.category || 'Geral',
        count: 0,
        revenue: 0,
      };
    }
    serviceRankingMap[sName].count += 1;
    serviceRankingMap[sName].revenue += price;
  });

  // Ordena ranking de serviços por faturamento decrescente
  const serviceRanking = Object.values(serviceRankingMap).sort(
    (a, b) => b.revenue - a.revenue
  );

  // 4. Total de Despesas
  const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // 5. Lucro Líquido
  const netProfit = totalRevenue - totalExpenses;

  // 6. Atendimentos & Ticket Médio
  const totalAppointments = monthlyProcedures.length;
  const averageTicket = totalAppointments > 0 ? totalRevenue / totalAppointments : 0;

  // 7. Meta e Progresso
  const goalProgress = goal > 0 ? Math.min(Math.round((totalRevenue / goal) * 100), 100) : 0;
  const remainingForGoal = Math.max(goal - totalRevenue, 0);

  // 8. Previsão / Potencial de Retornos do Mês
  const upcomingMonthReturns = procedures.filter((p) => {
    const due = toDateObject(p.dueDate);
    return (
      due.getFullYear() === targetYear &&
      due.getMonth() === targetMonth &&
      p.status !== 'completed'
    );
  });

  const potentialReturnRevenue = upcomingMonthReturns.reduce((sum, p) => {
    const price = typeof p.price === 'number' && p.price > 0
      ? p.price
      : getDefaultPriceForService(p.serviceName);
    return sum + price;
  }, 0);

  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    totalAppointments,
    averageTicket,
    paymentBreakdown,
    serviceRanking,
    goal,
    goalProgress,
    remainingForGoal,
    monthlyProcedures,
    monthlyExpenses,
    upcomingReturnsCount: upcomingMonthReturns.length,
    potentialReturnRevenue,
  };
};

/**
 * Formata valor em Real Brasileiro R$ 0,00
 */
export const formatCurrency = (val) => {
  return (Number(val) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
};
