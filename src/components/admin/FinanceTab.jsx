import React, { useState } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import {
  calculateFinanceMetrics,
  formatCurrency,
  saveMonthlyGoal,
  getMonthlyGoal,
  deleteExpense,
} from '../../services/financeService';
import { toDateObject } from '../../services/procedureService';
import { getDefaultPriceForService } from '../../data/procedureDefaults';

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

/**
 * FinanceTab — Painel de Controle Financeiro, Metas e Ranking de Serviços.
 */
const FinanceTab = ({
  procedures = [],
  expenses = [],
  loading = false,
  onRefresh,
  onOpenNewProcedure,
  onOpenNewExpense,
}) => {
  const currentDate = new Date();
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('overview'); // 'overview' | 'statement'

  const yearMonthKey = `${selectedYear}_${selectedMonth}`;
  const monthlyGoal = getMonthlyGoal(yearMonthKey);

  // Calcula métricas
  const metrics = calculateFinanceMetrics(
    procedures,
    expenses,
    selectedYear,
    selectedMonth,
    monthlyGoal
  );

  // Navegação de mês
  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSetCurrentMonth = () => {
    setSelectedYear(currentDate.getFullYear());
    setSelectedMonth(currentDate.getMonth());
  };

  const handleSaveGoal = (e) => {
    e.preventDefault();
    const val = Number(goalInput);
    if (val > 0) {
      saveMonthlyGoal(yearMonthKey, val);
    }
    setEditingGoal(false);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Tem certeza que deseja excluir esta despesa?')) return;
    try {
      await deleteExpense(expenseId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao excluir despesa:', err);
    }
  };

  // Extrato combinado (Procedimentos + Despesas ordenados por data)
  const combinedStatement = [
    ...metrics.monthlyProcedures.map((p) => ({
      id: `proc_${p.id}`,
      type: 'income',
      title: p.serviceName,
      subtitle: p.clientName,
      amount: typeof p.price === 'number' && p.price > 0 ? p.price : getDefaultPriceForService(p.serviceName),
      paymentMethod: p.paymentMethod || 'pix',
      date: toDateObject(p.performedAt),
      raw: p,
    })),
    ...metrics.monthlyExpenses.map((e) => ({
      id: `exp_${e.id}`,
      type: 'expense',
      title: e.description,
      subtitle: e.category,
      amount: typeof e.amount === 'number' ? e.amount : 0,
      date: toDateObject(e.date),
      raw: e,
    })),
  ].sort((a, b) => b.date - a.date);

  const isCurrentMonth =
    selectedYear === currentDate.getFullYear() && selectedMonth === currentDate.getMonth();

  return (
    <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
      {/* ============ NAVEGADOR DE MÊS E ANO ============ */}
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/20 flex items-center justify-between text-white">
        <button
          onClick={handlePrevMonth}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-all"
        >
          ‹
        </button>

        <div className="text-center">
          <p className="font-serif font-bold text-sm tracking-wide">
            {MONTH_NAMES[selectedMonth]} {selectedYear}
          </p>
          {!isCurrentMonth && (
            <button
              onClick={handleSetCurrentMonth}
              className="text-[10px] text-amber-300 hover:underline block mx-auto font-medium mt-0.5"
            >
              Ir para Mês Atual
            </button>
          )}
        </div>

        <button
          onClick={handleNextMonth}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold transition-all"
        >
          ›
        </button>
      </div>

      {/* ============ BARRA DE SUB-ABAS (VISÃO GERAL / EXTRATO) ============ */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'overview'
              ? 'bg-white text-brand-primary shadow-md'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          📊 Visão Geral & Ranking
        </button>
        <button
          onClick={() => setActiveSubTab('statement')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'statement'
              ? 'bg-white text-brand-primary shadow-md'
              : 'bg-white/10 text-white/70 hover:bg-white/15'
          }`}
        >
          📋 Extrato ({combinedStatement.length})
        </button>
      </div>

      {/* Conteúdo com Scroll */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : activeSubTab === 'overview' ? (
          <>
            {/* ============ META DO MÊS ============ */}
            <div className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-400/40 rounded-2xl p-3.5 text-white shadow-lg backdrop-blur-sm">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🎯</span>
                  <span className="text-xs font-bold text-amber-200 uppercase tracking-wider">
                    Meta de {MONTH_NAMES[selectedMonth]}
                  </span>
                </div>
                <button
                  onClick={() => {
                    setGoalInput(String(monthlyGoal));
                    setEditingGoal(true);
                  }}
                  className="text-[10px] text-amber-300 underline font-semibold"
                >
                  Editar Meta
                </button>
              </div>

              {editingGoal ? (
                <form onSubmit={handleSaveGoal} className="flex gap-2 mt-2">
                  <input
                    type="number"
                    step="100"
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 rounded-xl bg-black/40 border border-amber-400 text-white text-xs font-bold outline-none"
                    placeholder="Ex: 5000"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-amber-400 text-brand-primary font-bold text-xs rounded-xl"
                  >
                    Salvar
                  </button>
                </form>
              ) : (
                <>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-lg font-serif font-bold text-white">
                      {formatCurrency(metrics.totalRevenue)}
                    </span>
                    <span className="text-xs text-amber-200">
                      Meta: {formatCurrency(metrics.goal)} ({metrics.goalProgress}%)
                    </span>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full bg-black/30 h-2.5 rounded-full overflow-hidden mt-2 p-0.5 border border-white/10">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-yellow-300 h-full rounded-full transition-all duration-500 shadow-sm"
                      style={{ width: `${metrics.goalProgress}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-amber-100/80 mt-1.5 text-right font-medium">
                    {metrics.remainingForGoal > 0
                      ? `Faltam ${formatCurrency(metrics.remainingForGoal)} para bater a meta! 🚀`
                      : '🎉 Parabéns! Meta batida com sucesso! 🏆'}
                  </p>
                </>
              )}
            </div>

            {/* ============ CARDS DE RESUMO (BRUTO, DESPESAS, LUCRO) ============ */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-white">
                <span className="text-[10px] text-white/60 font-semibold block">Faturamento</span>
                <p className="text-base sm:text-lg font-bold font-serif text-emerald-400 mt-0.5 truncate">
                  {formatCurrency(metrics.totalRevenue)}
                </p>
                <span className="text-[10px] text-white/50">{metrics.totalAppointments} atend.</span>
              </div>

              <div className="bg-white/10 border border-white/15 rounded-2xl p-3 text-white">
                <span className="text-[10px] text-white/60 font-semibold block">Gastos</span>
                <p className="text-base sm:text-lg font-bold font-serif text-rose-400 mt-0.5 truncate">
                  {formatCurrency(metrics.totalExpenses)}
                </p>
                <span className="text-[10px] text-white/50">{metrics.monthlyExpenses.length} despesas</span>
              </div>

              <div className="bg-white/10 border border-emerald-400/40 rounded-2xl p-3 text-white shadow-lg">
                <span className="text-[10px] text-emerald-200 font-bold block">Lucro Líquido</span>
                <p className="text-base sm:text-lg font-bold font-serif text-white mt-0.5 truncate">
                  {formatCurrency(metrics.netProfit)}
                </p>
                <span className="text-[10px] text-emerald-300/80">No bolso</span>
              </div>
            </div>

            {/* Card de Ticket Médio */}
            <div className="bg-white rounded-2xl p-3.5 shadow-md flex items-center justify-between text-brand-primary">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                    Ticket Médio por Cliente
                  </p>
                  <p className="text-sm font-bold">{formatCurrency(metrics.averageTicket)}</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg">
                {metrics.totalAppointments} atendimentos
              </span>
            </div>

            {/* ============ POTENCIAL DE RETORNOS ============ */}
            {metrics.upcomingReturnsCount > 0 && (
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-purple-400/30 rounded-2xl p-3.5 text-white backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-base">🔮</span>
                  <p className="text-xs font-bold text-purple-200">
                    Potencial de Retornos em {MONTH_NAMES[selectedMonth]}
                  </p>
                </div>
                <p className="text-xs text-white/80 leading-relaxed">
                  Você tem <strong>{metrics.upcomingReturnsCount} clientes</strong> com retorno previsto este mês. Se todas confirmarem, o potencial extra é de:
                </p>
                <p className="text-lg font-serif font-bold text-purple-300 mt-1">
                  + {formatCurrency(metrics.potentialReturnRevenue)}
                </p>
              </div>
            )}

            {/* ============ RANKING DE SERVIÇOS MAIS VENDIDOS ============ */}
            <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-base">🏆</span>
                  <h3 className="font-serif font-bold text-xs text-brand-primary uppercase tracking-wider">
                    Ranking de Serviços ({MONTH_NAMES[selectedMonth]})
                  </h3>
                </div>
                <span className="text-[10px] text-gray-400">Por Faturamento</span>
              </div>

              {metrics.serviceRanking.length > 0 ? (
                <div className="space-y-2.5">
                  {metrics.serviceRanking.map((srv, idx) => {
                    const pct = metrics.totalRevenue > 0 ? (srv.revenue / metrics.totalRevenue) * 100 : 0;
                    return (
                      <div key={srv.name} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-brand-primary truncate">
                            #{idx + 1} {srv.name} ({srv.count}x)
                          </span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(srv.revenue)}
                          </span>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-primary h-full rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-xs py-3 italic">
                  Nenhum serviço registrado neste mês.
                </p>
              )}
            </div>

            {/* ============ FORMAS DE PAGAMENTO ============ */}
            <div className="bg-white rounded-2xl p-4 shadow-md space-y-3">
              <h3 className="font-serif font-bold text-xs text-brand-primary uppercase tracking-wider">
                Formas de Pagamento
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(metrics.paymentBreakdown)
                  .filter(([_, data]) => data.total > 0)
                  .map(([key, data]) => (
                    <div
                      key={key}
                      className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="text-gray-500 text-[10px] block">
                          {data.icon} {data.label} ({data.count}x)
                        </span>
                        <span className="font-bold text-brand-primary">
                          {formatCurrency(data.total)}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        ) : (
          /* ============ ABA: EXTRATO COMPLETO ============ */
          <div className="space-y-2.5">
            <div className="flex gap-2">
              <button
                onClick={onOpenNewProcedure}
                className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <span>➕</span>
                <span>+ Lançar Atendimento</span>
              </button>

              <button
                onClick={onOpenNewExpense}
                className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1"
              >
                <span>💸</span>
                <span>+ Lançar Gasto</span>
              </button>
            </div>

            {combinedStatement.length > 0 ? (
              combinedStatement.map((item) => {
                const formattedDate = item.date.toLocaleDateString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                });

                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 animate-fadeIn"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center text-base ${
                          item.type === 'income'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-rose-100 text-rose-700'
                        }`}
                      >
                        {item.type === 'income' ? '✨' : '💸'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-brand-primary text-xs truncate">
                          {item.title}
                        </p>
                        <p className="text-gray-400 text-[10px]">
                          {item.subtitle} • {formattedDate}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold whitespace-nowrap ${
                          item.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.type === 'income' ? '+' : '-'} {formatCurrency(item.amount)}
                      </span>

                      {item.type === 'expense' && (
                        <button
                          onClick={() => handleDeleteExpense(item.raw.id)}
                          className="text-gray-300 hover:text-rose-500 p-1 text-xs"
                          title="Excluir gasto"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-white/60 py-12 px-4 space-y-2">
                <span className="text-3xl block opacity-40">💰</span>
                <p className="text-xs font-bold text-white">Nenhum lançamento em {MONTH_NAMES[selectedMonth]}.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceTab;
