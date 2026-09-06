import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { PROCEDURE_CATEGORIES } from '../../data/procedureDefaults';
import {
  getProcedureStatusInfo,
  toDateObject,
  buildWhatsAppUrl,
  getFormattedMessageForProcedure,
  updateProcedureStatus,
  deleteProcedure,
  postponeProcedureDueDate,
} from '../../services/procedureService';

/**
 * RemindersTab — Painel Avançado de Gestão de Retornos, Pós-Venda e CRM.
 */
const RemindersTab = ({
  procedures = [],
  loading = false,
  onRefresh,
  onOpenNewProcedure,
  onOpenNewClient,
  onRenewProcedure,
}) => {
  const [filter, setFilter] = useState('auto'); // 'auto' | 'urgent' | 'upcoming' | 'all' | 'contacted'
  const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'cilios' | 'sobrancelhas' | 'depilacao' | 'outro'
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [previewModal, setPreviewModal] = useState(null); // { procedure, text }

  // Mapeia procedimentos com suas informações de status temporal
  const enrichedProcedures = procedures.map((p) => {
    const statusInfo = getProcedureStatusInfo(p.performedAt, p.dueDate, p.status);
    return {
      ...p,
      statusInfo,
    };
  });

  // Contadores para os badges
  const urgentCount = enrichedProcedures.filter(
    (p) =>
      p.status !== 'contacted' &&
      p.status !== 'completed' &&
      (p.statusInfo.type === 'today' || p.statusInfo.type === 'overdue')
  ).length;

  const upcomingCount = enrichedProcedures.filter(
    (p) =>
      p.status !== 'contacted' &&
      p.status !== 'completed' &&
      p.statusInfo.type === 'upcoming'
  ).length;

  const contactedCount = enrichedProcedures.filter(
    (p) => p.status === 'contacted' || p.status === 'completed'
  ).length;

  // Ajuste inteligente do filtro inicial: se não houver urgentes, mostra todos
  const activeStatusFilter =
    filter === 'auto'
      ? urgentCount > 0
        ? 'urgent'
        : 'all'
      : filter;

  // Filtragem combinada (Status + Categoria + Busca)
  const filteredProcedures = enrichedProcedures.filter((p) => {
    // 1. Filtro de Texto
    const matchesSearch =
      p.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.serviceName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.clientPhone?.includes(searchTerm);

    if (!matchesSearch) return false;

    // 2. Filtro por Categoria de Serviço
    if (categoryFilter !== 'all') {
      const pCat = (p.category || '').toLowerCase();
      if (categoryFilter === 'cilios' && !pCat.includes('cílios') && !pCat.includes('cilios')) return false;
      if (categoryFilter === 'sobrancelhas' && !pCat.includes('sobrancelha')) return false;
      if (categoryFilter === 'depilacao' && !pCat.includes('depilação') && !pCat.includes('depilacao')) return false;
      if (categoryFilter === 'outro' && (pCat.includes('cílios') || pCat.includes('cilios') || pCat.includes('sobrancelha') || pCat.includes('depilacao') || pCat.includes('depilação'))) return false;
    }

    // 3. Filtro de Status
    if (activeStatusFilter === 'urgent') {
      return (
        p.status !== 'contacted' &&
        p.status !== 'completed' &&
        (p.statusInfo.type === 'today' || p.statusInfo.type === 'overdue')
      );
    }
    if (activeStatusFilter === 'upcoming') {
      return (
        p.status !== 'contacted' &&
        p.status !== 'completed' &&
        p.statusInfo.type === 'upcoming'
      );
    }
    if (activeStatusFilter === 'contacted') {
      return p.status === 'contacted' || p.status === 'completed';
    }

    // 'all'
    return true;
  });

  // Ação de Enviar WhatsApp
  const handleOpenWhatsApp = (procedure) => {
    const message = getFormattedMessageForProcedure(procedure);
    const url = buildWhatsAppUrl(procedure.clientPhone, message);
    window.open(url, '_blank');

    // Abre diálogo amigável pós envio
    setPreviewModal({
      procedure,
      text: message,
    });
  };

  // Alterar Status
  const handleStatusChange = async (procedureId, newStatus) => {
    setActionLoadingId(procedureId);
    try {
      await updateProcedureStatus(procedureId, newStatus);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    } finally {
      setActionLoadingId(null);
      setPreviewModal(null);
    }
  };

  // Adiar Retorno (+7 dias)
  const handlePostpone = async (procedure) => {
    if (!window.confirm(`Deseja adiar o lembrete de "${procedure.clientName}" em mais 7 dias?`)) return;
    setActionLoadingId(procedure.id);
    try {
      await postponeProcedureDueDate(procedure.id, procedure.dueDate, 7);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao adiar:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Excluir Procedimento
  const handleDelete = async (procedureId) => {
    if (!window.confirm('Tem certeza que deseja excluir este acompanhamento?')) return;
    setActionLoadingId(procedureId);
    try {
      await deleteProcedure(procedureId);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Erro ao excluir:', err);
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-3.5 flex-1 flex flex-col overflow-hidden">
      {/* ============ CARDS DE MÉTRICAS / STATUS ============ */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setFilter('urgent')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all border ${
            activeStatusFilter === 'urgent'
              ? 'bg-rose-500/25 border-rose-400 text-white shadow-lg ring-2 ring-rose-400/30'
              : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-rose-200 truncate">
              🚨 Urgentes
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif mt-1 text-white">{urgentCount}</p>
        </button>

        <button
          onClick={() => setFilter('upcoming')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all border ${
            activeStatusFilter === 'upcoming'
              ? 'bg-purple-500/25 border-purple-400 text-white shadow-lg ring-2 ring-purple-400/30'
              : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-purple-200 truncate">
              📅 Próx. 7d
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif mt-1 text-white">{upcomingCount}</p>
        </button>

        <button
          onClick={() => setFilter('contacted')}
          className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all border ${
            activeStatusFilter === 'contacted'
              ? 'bg-blue-500/25 border-blue-400 text-white shadow-lg ring-2 ring-blue-400/30'
              : 'bg-white/10 border-white/10 text-white/80 hover:bg-white/15'
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className="text-[10px] sm:text-xs font-bold text-blue-200 truncate">
              ✅ Avisadas
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif mt-1 text-white">{contactedCount}</p>
        </button>
      </div>

      {/* ============ BOTÃO DE REGISTRO + TODOS ============ */}
      <div className="flex gap-2">
        <button
          onClick={onOpenNewProcedure}
          className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-brand-primary font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
        >
          <span>✨</span>
          <span>+ Registrar Atendimento</span>
        </button>

        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-3 rounded-xl text-xs font-bold transition-all border ${
            activeStatusFilter === 'all'
              ? 'bg-white text-brand-primary border-white shadow-md'
              : 'bg-white/10 text-white/70 border-white/20 hover:bg-white/20'
          }`}
          title="Ver todos os procedimentos"
        >
          Todos ({procedures.length})
        </button>
      </div>

      {/* ============ CHIPS / FILTROS POR CATEGORIA DE SERVIÇO ============ */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
            categoryFilter === 'all'
              ? 'bg-white text-brand-primary border-white shadow-sm'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          🌟 Todos Serviços
        </button>

        <button
          onClick={() => setCategoryFilter('cilios')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
            categoryFilter === 'cilios'
              ? 'bg-white text-brand-primary border-white shadow-sm'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          👁️ Cílios
        </button>

        <button
          onClick={() => setCategoryFilter('sobrancelhas')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
            categoryFilter === 'sobrancelhas'
              ? 'bg-white text-brand-primary border-white shadow-sm'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          ✨ Sobrancelhas
        </button>

        <button
          onClick={() => setCategoryFilter('depilacao')}
          className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all border ${
            categoryFilter === 'depilacao'
              ? 'bg-white text-brand-primary border-white shadow-sm'
              : 'bg-white/10 text-white/70 border-white/15 hover:bg-white/20'
          }`}
        >
          💆‍♀️ Depilação
        </button>
      </div>

      {/* ============ BUSCA INTELIGENTE ============ */}
      <input
        type="text"
        placeholder="Buscar por cliente, procedimento ou telefone..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 outline-none text-xs transition-all"
      />

      {/* ============ LISTAGEM DE RETORNOS / PROCEDIMENTOS ============ */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
        {loading ? (
          <div className="py-12">
            <LoadingSpinner size="md" />
          </div>
        ) : filteredProcedures.length > 0 ? (
          filteredProcedures.map((proc) => {
            const perfDateObj = toDateObject(proc.performedAt);
            const formattedPerfDate = perfDateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            });
            const dueDateObj = toDateObject(proc.dueDate);
            const formattedDueDate = dueDateObj.toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit',
            });

            return (
              <div
                key={proc.id}
                className="bg-white rounded-2xl p-4 shadow-lg flex flex-col gap-3 animate-fadeIn border border-white/50"
              >
                {/* Header do Card: Nome da Cliente e Badge de Urgência */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-brand-primary text-sm truncate">
                      {proc.clientName}
                    </p>
                    <p className="text-brand-text text-[11px] font-mono">{proc.clientPhone}</p>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full border whitespace-nowrap ${proc.statusInfo.badgeClass}`}
                  >
                    {proc.statusInfo.label}
                  </span>
                </div>

                {/* Detalhes do Procedimento e Prazos */}
                <div className="bg-brand-light/40 rounded-xl p-2.5 text-xs text-brand-text space-y-1">
                  <div className="flex items-center justify-between font-medium">
                    <span className="text-brand-primary font-bold truncate">
                      ✨ {proc.serviceName}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold bg-white px-2 py-0.5 rounded-md border border-brand-light">
                      Ciclo: {proc.maintenanceDays}d
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <span>Feito: <strong>{formattedPerfDate}</strong> ({proc.statusInfo.daysAgo}d atrás)</span>
                    <span>Retorno: <strong className="text-brand-primary">{formattedDueDate}</strong></span>
                  </div>
                  {proc.notes && (
                    <p className="text-[11px] text-brand-secondary italic pt-1 border-t border-brand-light">
                      📝 {proc.notes}
                    </p>
                  )}
                  {proc.lastContactedAt && (
                    <p className="text-[10px] text-blue-600 font-semibold pt-0.5">
                      ✓ Mensagem enviada em {toDateObject(proc.lastContactedAt).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>

                {/* Linha 1 de Ações: Botão Grande de WhatsApp */}
                <button
                  onClick={() => handleOpenWhatsApp(proc)}
                  className="w-full py-3 px-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  <span>Mandar Mensagem no WhatsApp</span>
                </button>

                {/* Linha 2 de Ações: Status, Adiar, Renovar e Excluir */}
                <div className="flex items-center gap-1.5 pt-0.5">
                  {/* Marcar como Contatado / Pendente */}
                  {proc.status === 'contacted' ? (
                    <button
                      onClick={() => handleStatusChange(proc.id, 'pending')}
                      disabled={actionLoadingId === proc.id}
                      className="flex-1 py-2 px-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 text-[11px] font-semibold transition-colors"
                      title="Voltar para pendente"
                    >
                      ↩ Desfazer
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(proc.id, 'contacted')}
                      disabled={actionLoadingId === proc.id}
                      className="flex-1 py-2 px-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-[11px] font-bold transition-colors"
                      title="Marcar como já contatada"
                    >
                      {actionLoadingId === proc.id ? '...' : '✓ Já Avisei'}
                    </button>
                  )}

                  {/* Adiar +7 dias */}
                  <button
                    onClick={() => handlePostpone(proc)}
                    disabled={actionLoadingId === proc.id}
                    className="py-2 px-2.5 rounded-xl bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 text-[11px] font-medium transition-colors"
                    title="Adiar lembrete em 7 dias"
                  >
                    ⏰ +7 dias
                  </button>

                  {/* Renovar / Fez Manutenção */}
                  {onRenewProcedure && (
                    <button
                      onClick={() => onRenewProcedure(proc)}
                      className="py-2 px-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 text-[11px] font-bold transition-colors"
                      title="Registrar nova manutenção para esta cliente"
                    >
                      🔄 Fez Retorno
                    </button>
                  )}

                  {/* Excluir */}
                  <button
                    onClick={() => handleDelete(proc.id)}
                    disabled={actionLoadingId === proc.id}
                    className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    title="Excluir acompanhamento"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center text-white/70 py-10 px-4 space-y-3 bg-white/5 rounded-2xl border border-white/10">
            <span className="text-3xl block opacity-50">✨</span>
            <p className="text-xs font-bold text-white">Nenhum atendimento encontrado com os filtros atuais.</p>
            <p className="text-[11px] text-white/50">
              {procedures.length > 0
                ? 'Tente selecionar "Todos" ou limpar a busca acima.'
                : 'Clique abaixo para registrar o primeiro atendimento e começar a acompanhar!'}
            </p>
            {procedures.length > 0 ? (
              <button
                onClick={() => {
                  setFilter('all');
                  setCategoryFilter('all');
                  setSearchTerm('');
                }}
                className="py-2 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all"
              >
                Limpar Filtros e Ver Todos
              </button>
            ) : (
              <button
                onClick={onOpenNewProcedure}
                className="py-2 px-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-brand-primary text-xs font-bold shadow-lg transition-all"
              >
                + Cadastrar Primeiro Atendimento
              </button>
            )}
          </div>
        )}
      </div>

      {/* ============ MODAL DE CONFIRMAÇÃO PÓS-WHATSAPP ============ */}
      {previewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full space-y-4 animate-scaleUp shadow-2xl">
            <div className="text-center">
              <span className="text-3xl block mb-2">💬</span>
              <h3 className="font-serif font-bold text-brand-primary text-base">
                Mensagem Aberta no WhatsApp!
              </h3>
              <p className="text-brand-text text-xs mt-1">
                Deseja marcar <strong>{previewModal.procedure.clientName}</strong> como avisada?
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-3 text-[11px] text-gray-600 max-h-32 overflow-y-auto whitespace-pre-line border border-gray-200 font-sans">
              {previewModal.text}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setPreviewModal(null)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold"
              >
                Apenas Fechar
              </button>
              <button
                onClick={() => handleStatusChange(previewModal.procedure.id, 'contacted')}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700"
              >
                ✓ Sim, Marcar Avisada
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersTab;
