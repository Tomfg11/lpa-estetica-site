import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useScanner from '../hooks/useScanner';
import {
  getUserData,
  addPoint,
  redeemReward,
  getMaxPoints,
  getAllClients,
} from '../services/fidelityService';
import {
  getAllProcedures,
  getClientProcedures,
  getProcedureStatusInfo,
  toDateObject,
} from '../services/procedureService';
import { getAllExpenses } from '../services/financeService';

import Modal from '../components/ui/Modal';
import FidelityCard from '../components/ui/FidelityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import CreateClientModal from '../components/ui/CreateClientModal';
import ProcedureModal from '../components/ui/ProcedureModal';
import ExpenseModal from '../components/ui/ExpenseModal';
import RemindersTab from '../components/admin/RemindersTab';
import FinanceTab from '../components/admin/FinanceTab';
import logo from '../assets/logo-lpa.png';

/**
 * AdminDashboard — Painel da administradora.
 * Abas: Retornos / Pós-Venda | Financeiro | Scanner | Clientes
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Controle de Abas
  const [activeTab, setActiveTab] = useState('reminders'); // 'reminders' | 'finance' | 'scanner' | 'list'

  // Estados do Scanner e Modal de Cliente
  const [scannedClient, setScannedClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [clientProcedures, setClientProcedures] = useState([]);
  const [clientProceduresLoading, setClientProceduresLoading] = useState(false);
  const [showAllHistory, setShowAllHistory] = useState(false);

  // Estados da Lista de Clientes
  const [clients, setClients] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Estados de Procedimentos / Retornos
  const [procedures, setProcedures] = useState([]);
  const [proceduresLoading, setProceduresLoading] = useState(false);

  // Estados Financeiros / Despesas
  const [expenses, setExpenses] = useState([]);
  const [expensesLoading, setExpensesLoading] = useState(false);

  // Modais de Criação
  const [createClientOpen, setCreateClientOpen] = useState(false);
  const [procedureModalOpen, setProcedureModalOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [targetProcedureClient, setTargetProcedureClient] = useState(null);

  const maxPoints = getMaxPoints();

  // Carrega clientes, procedimentos e despesas ao iniciar
  useEffect(() => {
    fetchClients();
    fetchProcedures();
    fetchExpenses();
  }, []);

  // Recarrega dados ao mudar de aba
  useEffect(() => {
    if (activeTab === 'list') {
      fetchClients();
    } else if (activeTab === 'reminders') {
      fetchProcedures();
    } else if (activeTab === 'finance') {
      fetchProcedures();
      fetchExpenses();
    }
  }, [activeTab]);

  const fetchClients = async () => {
    setListLoading(true);
    try {
      const data = await getAllClients();
      setClients(data);
    } catch (err) {
      console.error('Erro ao buscar clientes:', err);
    } finally {
      setListLoading(false);
    }
  };

  const fetchProcedures = async () => {
    setProceduresLoading(true);
    try {
      const data = await getAllProcedures();
      setProcedures(data);
    } catch (err) {
      console.error('Erro ao buscar procedimentos:', err);
    } finally {
      setProceduresLoading(false);
    }
  };

  const fetchExpenses = async () => {
    setExpensesLoading(true);
    try {
      const data = await getAllExpenses();
      setExpenses(data);
    } catch (err) {
      console.error('Erro ao buscar despesas:', err);
    } finally {
      setExpensesLoading(false);
    }
  };

  /**
   * Busca histórico de procedimentos ao abrir detalhes do cliente
   */
  const fetchClientHistory = async (clientId) => {
    if (!clientId) return;
    setClientProceduresLoading(true);
    try {
      const hist = await getClientProcedures(clientId);
      setClientProcedures(hist);
    } catch (err) {
      console.error('Erro ao buscar histórico do cliente:', err);
    } finally {
      setClientProceduresLoading(false);
    }
  };

  /**
   * Callback do scanner
   */
  const handleScanSuccess = useCallback(
    async (scannedUid) => {
      if (clientLoading) return;
      setClientLoading(true);
      try {
        const clientData = await getUserData(scannedUid);
        setScannedClient(clientData);
        setShowAllHistory(false);
        setModalOpen(true);
        fetchClientHistory(clientData.id);
      } catch (err) {
        setFeedback({ type: 'error', message: 'Cliente não encontrado.' });
      } finally {
        setClientLoading(false);
      }
    },
    [clientLoading]
  );

  const {
    startScanning,
    stopScanning,
    isScanning,
    error: scanError,
    scannerContainerId,
  } = useScanner(handleScanSuccess);

  const openClientModal = (client) => {
    setScannedClient(client);
    setFeedback({ type: '', message: '' });
    setShowAllHistory(false);
    setModalOpen(true);
    fetchClientHistory(client.id);
  };

  const handleAddPoint = async (clientId = null) => {
    const targetId = clientId || scannedClient?.id;
    if (!targetId || !user) return;
    setActionLoading(true);
    try {
      const result = await addPoint(targetId, user.uid);

      if (scannedClient && scannedClient.id === targetId) {
        setScannedClient((prev) => ({ ...prev, points: result.newPoints }));
      }

      setClients((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, points: result.newPoints } : c))
      );

      setFeedback({
        type: result.isCardComplete ? 'complete' : 'success',
        message: result.isCardComplete ? '🏆 Cartão completo!' : '✅ Ponto adicionado!',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Erro ao adicionar ponto.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRedeem = async (clientId = null) => {
    const targetId = clientId || scannedClient?.id;
    if (!targetId || !user) return;
    setActionLoading(true);
    try {
      await redeemReward(targetId, user.uid);
      if (scannedClient && scannedClient.id === targetId) {
        setScannedClient((prev) => ({ ...prev, points: 0 }));
      }
      setClients((prev) =>
        prev.map((c) => (c.id === targetId ? { ...c, points: 0 } : c))
      );
      setFeedback({ type: 'success', message: '🎉 Recompensa resgatada e cartão zerado!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao resgatar.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openWhatsApp = (phone) => {
    if (!phone) return;
    const number = phone.replace(/\D/g, '');
    const cleanNumber = number.startsWith('55') ? number : `55${number}`;
    window.open(`https://wa.me/${cleanNumber}`, '_blank');
  };

  // Abre modal de procedimento para cliente específico
  const handleOpenProcedureForClient = (client) => {
    setTargetProcedureClient(client);
    setProcedureModalOpen(true);
  };

  // Callbacks pós criação
  const handleClientCreated = (newClient) => {
    setClients((prev) => [newClient, ...prev]);
    if (window.confirm(`Cliente "${newClient.name}" cadastrada! Deseja registrar um procedimento para ela agora?`)) {
      handleOpenProcedureForClient(newClient);
    }
  };

  const handleProcedureSaved = (newProcedure) => {
    fetchProcedures();
    fetchClients();
    if (scannedClient && scannedClient.id === newProcedure.clientId) {
      fetchClientHistory(scannedClient.id);
    }
  };

  const handleExpenseSaved = () => {
    fetchExpenses();
  };

  // Contagem de retornos urgentes para badge na aba
  const urgentRemindersCount = procedures.filter((p) => {
    if (p.status === 'contacted' || p.status === 'completed') return false;
    const statusInfo = getProcedureStatusInfo(p.performedAt, p.dueDate, p.status);
    return statusInfo.type === 'today' || statusInfo.type === 'overdue';
  }).length;

  const filteredClients = clients.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary to-[#5C1E28] flex flex-col">
      {/* Header */}
      <div className="pt-6 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="LPA" className="h-10 w-10 rounded-full border-2 border-white/30" />
          <span className="font-serif text-white font-bold text-lg">Admin LPA</span>
        </div>
        <button
          onClick={() => logout().then(() => navigate('/login-admin'))}
          className="text-white/70 text-xs hover:text-white transition-colors"
        >
          Sair →
        </button>
      </div>

      {/* Navegação de 4 Abas */}
      <div className="mt-5 px-4 flex gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
            activeTab === 'reminders'
              ? 'bg-white text-brand-primary shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span>🔔 Retornos</span>
          {urgentRemindersCount > 0 && (
            <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
              {urgentRemindersCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
            activeTab === 'finance'
              ? 'bg-white text-brand-primary shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span>💰 Financeiro</span>
        </button>

        <button
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
            activeTab === 'scanner'
              ? 'bg-white text-brand-primary shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span>📷 Scanner</span>
        </button>

        <button
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-2 px-2 rounded-xl font-bold text-[11px] whitespace-nowrap transition-all flex items-center justify-center gap-1 ${
            activeTab === 'list'
              ? 'bg-white text-brand-primary shadow-lg'
              : 'bg-white/10 text-white/70 hover:bg-white/20'
          }`}
        >
          <span>👥 Clientes</span>
        </button>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col px-4 py-4 gap-4 max-w-md mx-auto w-full">
        {/* ============ ABA 1: RETORNOS / LEMBRETES ============ */}
        {activeTab === 'reminders' && (
          <RemindersTab
            procedures={procedures}
            loading={proceduresLoading}
            onRefresh={fetchProcedures}
            onOpenNewProcedure={() => {
              setTargetProcedureClient(null);
              setProcedureModalOpen(true);
            }}
            onOpenNewClient={() => setCreateClientOpen(true)}
            onRenewProcedure={(proc) => {
              const clientObj = clients.find((c) => c.id === proc.clientId) || {
                id: proc.clientId,
                name: proc.clientName,
                phoneNumber: proc.clientPhone,
              };
              setTargetProcedureClient(clientObj);
              setProcedureModalOpen(true);
            }}
          />
        )}

        {/* ============ ABA 2: FINANCEIRO ============ */}
        {activeTab === 'finance' && (
          <FinanceTab
            procedures={procedures}
            expenses={expenses}
            loading={proceduresLoading || expensesLoading}
            onRefresh={() => {
              fetchProcedures();
              fetchExpenses();
            }}
            onOpenNewProcedure={() => {
              setTargetProcedureClient(null);
              setProcedureModalOpen(true);
            }}
            onOpenNewExpense={() => setExpenseModalOpen(true)}
          />
        )}

        {/* ============ ABA 3: SCANNER ============ */}
        {activeTab === 'scanner' && (
          <div className="space-y-4 animate-fadeIn">
            <div className="w-full bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden relative min-h-[300px] flex items-center justify-center">
              <div id={scannerContainerId} className="w-full h-full" />
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3 opacity-30">📷</span>
                  <p className="text-white/60 text-sm">Câmera desligada</p>
                  <p className="text-white/40 text-xs mt-1">
                    Aponte para o QR Code da cliente para pontuar ou registrar atendimento
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={isScanning ? stopScanning : startScanning}
              className={`w-full py-3.5 rounded-xl font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
                isScanning ? 'bg-red-500 text-white' : 'bg-white text-brand-primary'
              }`}
            >
              {isScanning ? '⏹ Parar Scanner' : '🔍 Ativar Câmera'}
            </button>

            {scanError && (
              <div className="bg-red-500/20 border border-red-400 p-3 rounded-xl text-white text-xs text-center">
                {scanError}
              </div>
            )}
          </div>
        )}

        {/* ============ ABA 4: LISTA DE CLIENTES ============ */}
        {activeTab === 'list' && (
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden animate-fadeIn">
            {/* Botão de Cadastro de Cliente */}
            <div className="flex gap-2">
              <button
                onClick={() => setCreateClientOpen(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-brand-primary font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5"
              >
                <span>👤</span>
                <span>+ Cadastrar Nova Cliente</span>
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 outline-none text-xs transition-all"
            />

            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {listLoading ? (
                <div className="py-12">
                  <LoadingSpinner size="md" />
                </div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="bg-white rounded-2xl p-3.5 shadow-lg flex items-center justify-between gap-3 animate-fadeIn"
                  >
                    <div
                      className="flex-1 min-w-0 cursor-pointer"
                      onClick={() => openClientModal(client)}
                    >
                      <p className="font-bold text-brand-primary text-xs truncate">
                        {client.name || 'Sem nome'}
                      </p>
                      <p className="text-brand-text text-[10px] font-mono">{client.phoneNumber}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-brand-accent h-full"
                            style={{
                              width: `${(Math.min(client.points || 0, maxPoints) / maxPoints) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-brand-primary whitespace-nowrap">
                          {client.points || 0}/{maxPoints}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {/* Botão + Procedimento Rápido */}
                      <button
                        onClick={() => handleOpenProcedureForClient(client)}
                        className="p-2 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                        title="Novo Atendimento / Retorno"
                      >
                        ✨
                      </button>

                      {/* Ver Detalhes */}
                      <button
                        onClick={() => openClientModal(client)}
                        className="p-2 bg-brand-light text-brand-primary rounded-lg hover:bg-brand-peach transition-colors"
                        title="Ver detalhes"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </button>

                      {/* WhatsApp */}
                      <button
                        onClick={() => openWhatsApp(client.phoneNumber)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/40 py-10 text-xs italic">
                  Nenhuma cliente encontrada.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============ MODAL DE DETALHES DA CLIENTE ============ */}
      <Modal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFeedback({ type: '', message: '' });
          setScannedClient(null);
        }}
        title="Gestão de Cliente"
      >
        {scannedClient && (
          <div className="space-y-4 animate-slideUp">
            <div className="flex items-center justify-between bg-brand-light/50 rounded-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-primary/10 rounded-full flex items-center justify-center text-lg">
                  👤
                </div>
                <div>
                  <p className="text-brand-primary font-bold text-xs">
                    {scannedClient.name || 'Cliente'}
                  </p>
                  <p className="text-brand-text text-[11px] font-mono">
                    {scannedClient.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModalOpen(false);
                  handleOpenProcedureForClient(scannedClient);
                }}
                className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-sm flex items-center gap-1"
              >
                <span>✨</span>
                <span>Novo Procedimento</span>
              </button>
            </div>

            {/* Cartão Fidelidade */}
            <FidelityCard
              currentPoints={scannedClient.points || 0}
              maxPoints={maxPoints}
            />

            {feedback.message && (
              <div
                className={`p-2.5 rounded-xl text-center text-xs font-medium animate-fadeIn ${
                  feedback.type === 'error'
                    ? 'bg-red-50 text-red-600'
                    : 'bg-green-50 text-green-700 border border-green-200'
                }`}
              >
                {feedback.message}
              </div>
            )}

            {/* Ações de Pontuação */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(scannedClient.points || 0) >= maxPoints ? (
                <button
                  onClick={() => handleRedeem()}
                  disabled={actionLoading}
                  className="col-span-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : '🎁 Resgatar e Zerar'}
                </button>
              ) : (
                <button
                  onClick={() => handleAddPoint()}
                  disabled={actionLoading}
                  className="py-3 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-lg hover:bg-brand-secondary transition-all flex items-center justify-center gap-1"
                >
                  {actionLoading ? <LoadingSpinner size="sm" /> : '➕ Adicionar Ponto'}
                </button>
              )}

              <button
                onClick={() => openWhatsApp(scannedClient.phoneNumber)}
                className="py-3 rounded-xl bg-green-500 text-white font-bold text-xs shadow-lg hover:bg-green-600 transition-all flex items-center justify-center gap-1"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
                <span>WhatsApp</span>
              </button>
            </div>

            {/* Histórico de Procedimentos da Cliente */}
            <div className="pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold text-brand-primary">
                  Histórico de Procedimentos
                </p>
                <span className="text-[10px] text-gray-400 font-normal">
                  {clientProcedures.length} registro(s)
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                {clientProceduresLoading ? (
                  <LoadingSpinner size="sm" />
                ) : clientProcedures.length > 0 ? (
                  <>
                    {(showAllHistory ? clientProcedures : clientProcedures.slice(0, 2)).map((cp) => {
                      const perfDate = toDateObject(cp.performedAt).toLocaleDateString('pt-BR');
                      const dueDate = toDateObject(cp.dueDate).toLocaleDateString('pt-BR');
                      return (
                        <div
                          key={cp.id}
                          className="bg-gray-50 rounded-xl p-2.5 text-[11px] border border-gray-100 animate-fadeIn"
                        >
                          <div className="flex justify-between font-bold text-brand-primary">
                            <span>{cp.serviceName}</span>
                            <span className="text-[10px] text-gray-500 font-normal">
                              Feito: {perfDate}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-500 text-[10px] mt-0.5">
                            <span>Retorno: {dueDate} ({cp.maintenanceDays}d)</span>
                            <span
                              className={`font-semibold ${
                                cp.status === 'contacted' ? 'text-blue-600' : 'text-amber-600'
                              }`}
                            >
                              {cp.status === 'contacted' ? 'Avisada ✓' : 'Pendente'}
                            </span>
                          </div>
                          {cp.notes && <p className="text-gray-400 italic mt-0.5">{cp.notes}</p>}
                        </div>
                      );
                    })}

                    {clientProcedures.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setShowAllHistory((prev) => !prev)}
                        className="w-full py-1.5 text-center text-[11px] font-bold text-brand-secondary hover:text-brand-primary bg-brand-light/30 rounded-lg transition-colors mt-1"
                      >
                        {showAllHistory
                          ? '▲ Mostrar apenas os recentes'
                          : `▼ Ver todos os ${clientProcedures.length} atendimentos`}
                      </button>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400 text-[11px] italic text-center py-2">
                    Nenhum procedimento registrado ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ============ MODAL: CADASTRAR CLIENTE ============ */}
      <CreateClientModal
        isOpen={createClientOpen}
        onClose={() => setCreateClientOpen(false)}
        onClientCreated={handleClientCreated}
      />

      {/* ============ MODAL: REGISTRAR PROCEDIMENTO ============ */}
      <ProcedureModal
        isOpen={procedureModalOpen}
        onClose={() => {
          setProcedureModalOpen(false);
          setTargetProcedureClient(null);
        }}
        clients={clients}
        initialClient={targetProcedureClient}
        onProcedureSaved={handleProcedureSaved}
        onOpenCreateClient={() => setCreateClientOpen(true)}
      />

      {/* ============ MODAL: LANÇAR DESPESA ============ */}
      <ExpenseModal
        isOpen={expenseModalOpen}
        onClose={() => setExpenseModalOpen(false)}
        onExpenseSaved={handleExpenseSaved}
      />
    </div>
  );
};

export default AdminDashboard;
