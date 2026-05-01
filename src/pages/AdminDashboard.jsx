import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import useScanner from '../hooks/useScanner';
import { getUserData, addPoint, redeemReward, getMaxPoints, getAllClients } from '../services/fidelityService';
import Modal from '../components/ui/Modal';
import FidelityCard from '../components/ui/FidelityCard';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import logo from '../assets/logo-lpa.png';

/**
 * AdminDashboard — Painel da administradora.
 * Possui duas abas: Scanner (para pontos rápidos) e Clientes (lista geral/CRM).
 */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Controle de Abas
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'list'

  // Estados do Scanner e Modal
  const [scannedClient, setScannedClient] = useState(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Estados da Lista de Clientes
  const [clients, setClients] = useState([]);
  const [listLoading, setListLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const maxPoints = getMaxPoints();

  /**
   * Busca lista de clientes ao mudar para a aba 'list'
   */
  useEffect(() => {
    if (activeTab === 'list') {
      fetchClients();
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

  /**
   * Callback do scanner
   */
  const handleScanSuccess = useCallback(async (scannedUid) => {
    if (clientLoading) return;
    setClientLoading(true);
    try {
      const clientData = await getUserData(scannedUid);
      setScannedClient(clientData);
      setModalOpen(true);
    } catch (err) {
      setFeedback({ type: 'error', message: 'Cliente não encontrado.' });
    } finally {
      setClientLoading(false);
    }
  }, [clientLoading]);

  const { startScanning, stopScanning, isScanning, error: scanError, scannerContainerId } = useScanner(handleScanSuccess);

  const handleAddPoint = async (clientId = null) => {
    const targetId = clientId || scannedClient?.id;
    if (!targetId || !user) return;
    setActionLoading(true);
    try {
      const result = await addPoint(targetId, user.uid);
      
      // Atualiza estado local se for o cliente do modal
      if (scannedClient && scannedClient.id === targetId) {
        setScannedClient(prev => ({ ...prev, points: result.newPoints }));
      }
      
      // Atualiza na lista geral se estiver aberta
      if (activeTab === 'list') {
        setClients(prev => prev.map(c => c.id === targetId ? { ...c, points: result.newPoints } : c));
      }

      setFeedback({
        type: result.isCardComplete ? 'complete' : 'success',
        message: result.isCardComplete ? '🏆 Cartão completo!' : '✅ Ponto adicionado!',
      });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao adicionar ponto.' });
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
        setScannedClient(prev => ({ ...prev, points: 0 }));
      }
      if (activeTab === 'list') {
        setClients(prev => prev.map(c => c.id === targetId ? { ...c, points: 0 } : c));
      }
      setFeedback({ type: 'success', message: '🎉 Recompensa resgatada e cartão zerado!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao resgatar.' });
    } finally {
      setActionLoading(false);
    }
  };

  const openWhatsApp = (phone) => {
    const number = phone.replace(/\D/g, '');
    window.open(`https://wa.me/55${number}`, '_blank');
  };

  const filteredClients = clients.filter(c => 
    c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phoneNumber?.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-primary to-[#5C1E28] flex flex-col">
      {/* Header */}
      <div className="pt-6 px-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src={logo} alt="LPA" className="h-10 w-10 rounded-full border-2 border-white/30" />
          <span className="font-serif text-white font-bold text-lg">Admin</span>
        </div>
        <button onClick={() => logout().then(() => navigate('/login-admin'))} className="text-white/70 text-sm">Sair →</button>
      </div>

      {/* Tabs Control */}
      <div className="mt-6 px-5 flex gap-2">
        <button 
          onClick={() => setActiveTab('scanner')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'scanner' ? 'bg-white text-brand-primary shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
        >
          📷 Scanner
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'list' ? 'bg-white text-brand-primary shadow-lg' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
        >
          👥 Clientes
        </button>
      </div>

      <div className="flex-1 flex flex-col px-5 py-6 gap-5 max-w-md mx-auto w-full">
        
        {/* ============ ABA: SCANNER ============ */}
        {activeTab === 'scanner' && (
          <>
            <div className="w-full bg-black/20 backdrop-blur-sm rounded-2xl overflow-hidden relative min-h-[300px] flex items-center justify-center">
              <div id={scannerContainerId} className="w-full h-full" />
              {!isScanning && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-3 opacity-30">📷</span>
                  <p className="text-white/60 text-sm">Câmera desligada</p>
                </div>
              )}
            </div>

            <button
              onClick={isScanning ? stopScanning : startScanning}
              className={`w-full py-4 rounded-xl font-bold text-sm shadow-xl transition-all flex items-center justify-center gap-2 ${isScanning ? 'bg-red-500 text-white' : 'bg-white text-brand-primary'}`}
            >
              {isScanning ? '⏹ Parar Scanner' : '🔍 Ativar Câmera'}
            </button>

            {scanError && <div className="bg-red-500/20 border border-red-400 p-3 rounded-xl text-white text-xs text-center">{scanError}</div>}
          </>
        )}

        {/* ============ ABA: LISTA DE CLIENTES ============ */}
        {activeTab === 'list' && (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            <input 
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:bg-white/20 outline-none transition-all"
            />

            <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              {listLoading ? (
                <div className="py-12"><LoadingSpinner size="md" /></div>
              ) : filteredClients.length > 0 ? (
                filteredClients.map(client => (
                  <div key={client.id} className="bg-white rounded-2xl p-4 shadow-lg flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-brand-primary text-sm truncate">{client.name || 'Sem nome'}</p>
                      <p className="text-brand-text text-[10px]">{client.phoneNumber}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex-1 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-brand-accent h-full" style={{ width: `${(client.points / maxPoints) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-brand-primary whitespace-nowrap">{client.points}/{maxPoints}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => { setScannedClient(client); setModalOpen(true); }}
                        className="p-2 bg-brand-light text-brand-primary rounded-lg hover:bg-brand-peach transition-colors"
                        title="Ver detalhes"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                      <button 
                        onClick={() => openWhatsApp(client.phoneNumber)}
                        className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                        title="WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center text-white/40 py-10 text-sm italic">Nenhum cliente encontrado.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============ MODAL DE DETALHES ============ */}
      <Modal isOpen={modalOpen} onClose={() => { setModalOpen(false); setFeedback({type:'', message:''}); }} title="Gestão de Cliente">
        {scannedClient && (
          <div className="space-y-5 animate-slideUp">
            <div className="flex items-center gap-3 bg-brand-light/50 rounded-xl p-4">
              <div className="w-12 h-12 bg-brand-primary/10 rounded-full flex items-center justify-center text-xl">👤</div>
              <div>
                <p className="text-brand-primary font-bold text-sm">{scannedClient.name || 'Cliente'}</p>
                <p className="text-brand-text text-xs">{scannedClient.phoneNumber}</p>
                <p className="text-brand-text text-[10px] opacity-60">Status: {scannedClient.points}/{maxPoints} pontos</p>
              </div>
            </div>

            <FidelityCard currentPoints={scannedClient.points} maxPoints={maxPoints} />

            {feedback.message && (
              <div className={`p-3 rounded-xl text-center text-sm font-medium animate-fadeIn ${feedback.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                {feedback.message}
              </div>
            )}

            <div className="space-y-3 pt-2">
              {scannedClient.points >= maxPoints ? (
                <button onClick={() => handleRedeem()} disabled={actionLoading} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                  {actionLoading ? <LoadingSpinner size="sm" /> : '🎁 Resgatar e Zerar Cartão'}
                </button>
              ) : (
                <button onClick={() => handleAddPoint()} disabled={actionLoading} className="w-full py-3.5 rounded-xl bg-brand-primary text-white font-bold shadow-lg flex items-center justify-center gap-2">
                  {actionLoading ? <LoadingSpinner size="sm" /> : '➕ Adicionar 1 Ponto'}
                </button>
              )}
              
              <button onClick={() => openWhatsApp(scannedClient.phoneNumber)} className="w-full py-3.5 rounded-xl bg-green-500 text-white font-bold shadow-lg flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
                Chamar no WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard;
