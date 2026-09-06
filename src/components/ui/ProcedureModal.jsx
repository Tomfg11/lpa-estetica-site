import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import {
  PROCEDURE_CATEGORIES,
  PAYMENT_METHODS,
  getDefaultPriceForService,
} from '../../data/procedureDefaults';
import { createProcedure } from '../../services/procedureService';
import { useAuth } from '../../hooks/useAuth';

/**
 * Modal para registro de procedimento/atendimento com cálculo de retorno e controle financeiro.
 */
const ProcedureModal = ({
  isOpen,
  onClose,
  clients = [],
  initialClient = null,
  onProcedureSaved,
  onOpenCreateClient,
}) => {
  const { user } = useAuth();

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(PROCEDURE_CATEGORIES[0].id);
  const [selectedService, setSelectedService] = useState(PROCEDURE_CATEGORIES[0].services[0].name);
  const [customServiceName, setCustomServiceName] = useState('');
  const [price, setPrice] = useState(PROCEDURE_CATEGORIES[0].services[0].defaultPrice || 115);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [performedDate, setPerformedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [maintenanceDays, setMaintenanceDays] = useState(PROCEDURE_CATEGORIES[0].defaultDays);
  const [notes, setNotes] = useState('');
  const [addPoint, setAddPoint] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Atualiza cliente quando initialClient muda
  useEffect(() => {
    if (initialClient) {
      setSelectedClientId(initialClient.id);
    } else if (clients.length > 0 && !selectedClientId) {
      setSelectedClientId(clients[0].id);
    }
  }, [initialClient, clients]);

  // Atualiza serviço, dias e preço padrão quando muda de categoria
  const handleCategoryChange = (catId) => {
    setSelectedCategory(catId);
    const cat = PROCEDURE_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.services.length > 0) {
      const firstSrv = cat.services[0];
      setSelectedService(firstSrv.name);
      setMaintenanceDays(firstSrv.defaultDays || cat.defaultDays);
      setPrice(firstSrv.defaultPrice || 50);
    }
  };

  // Atualiza dias e preço quando seleciona um serviço predefinido
  const handleServiceChange = (serviceName) => {
    setSelectedService(serviceName);
    const cat = PROCEDURE_CATEGORIES.find((c) => c.id === selectedCategory);
    if (cat) {
      const srv = cat.services.find((s) => s.name === serviceName);
      if (srv) {
        if (srv.defaultDays) setMaintenanceDays(srv.defaultDays);
        if (srv.defaultPrice) setPrice(srv.defaultPrice);
      }
    }
  };

  // Calcula a data de retorno estimada para exibição
  const calculateDueDateFormatted = () => {
    try {
      const [year, month, day] = performedDate.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      d.setDate(d.getDate() + Number(maintenanceDays));
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return '';
    }
  };

  const currentCategoryObj = PROCEDURE_CATEGORIES.find((c) => c.id === selectedCategory);
  const currentClientObj = initialClient || clients.find((c) => c.id === selectedClientId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedClientId) {
      setError('Selecione uma cliente.');
      return;
    }

    const finalServiceName =
      selectedCategory === 'outro' && customServiceName.trim()
        ? customServiceName.trim()
        : selectedService;

    if (!finalServiceName) {
      setError('Informe o procedimento realizado.');
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = performedDate.split('-').map(Number);
      const perfDate = new Date(year, month - 1, day, 12, 0, 0);

      const newProcedure = await createProcedure({
        clientId: selectedClientId,
        clientName: currentClientObj?.name || 'Cliente',
        clientPhone: currentClientObj?.phoneNumber || '',
        category: currentCategoryObj?.name || 'Procedimento',
        serviceName: finalServiceName,
        price: Number(price) || 0,
        paymentMethod: paymentMethod || 'pix',
        performedAt: perfDate,
        maintenanceDays: Number(maintenanceDays),
        notes,
        addFidelityPoint: addPoint,
        adminId: user?.uid,
      });

      // Limpa formulário
      setNotes('');
      setCustomServiceName('');
      if (onProcedureSaved) onProcedureSaved(newProcedure);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao registrar procedimento.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Registrar Atendimento / Procedimento">
      <form onSubmit={handleSubmit} className="space-y-3.5 animate-slideUp">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Cliente */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-brand-primary text-xs font-bold">Cliente *</label>
            {!initialClient && onOpenCreateClient && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCreateClient();
                }}
                className="text-brand-secondary text-[11px] font-bold hover:underline"
              >
                + Nova Cliente
              </button>
            )}
          </div>

          {initialClient ? (
            <div className="p-2.5 bg-brand-light/50 border border-brand-light rounded-xl flex items-center justify-between">
              <div>
                <p className="font-bold text-brand-primary text-xs">{initialClient.name}</p>
                <p className="text-brand-text text-[11px]">{initialClient.phoneNumber}</p>
              </div>
              <span className="text-[10px] bg-brand-primary/10 text-brand-primary font-bold px-2 py-0.5 rounded-full">
                {initialClient.points || 0} pts
              </span>
            </div>
          ) : (
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent text-xs bg-white outline-none"
            >
              <option value="">Selecione a cliente...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.phoneNumber})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Categoria do Procedimento */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1.5">
            Tipo de Serviço
          </label>
          <div className="grid grid-cols-2 gap-1.5">
            {PROCEDURE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryChange(cat.id)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all text-left ${
                  selectedCategory === cat.id
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm font-bold'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <span>{cat.icon}</span>
                <span className="truncate">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Serviço Específico */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Procedimento Realizado
          </label>
          {selectedCategory === 'outro' ? (
            <input
              type="text"
              required
              placeholder="Ex: Limpeza de pele, Maquiagem..."
              value={customServiceName}
              onChange={(e) => setCustomServiceName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none"
            />
          ) : (
            <select
              value={selectedService}
              onChange={(e) => handleServiceChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent text-xs bg-white outline-none"
            >
              {currentCategoryObj?.services.map((srv) => (
                <option key={srv.name} value={srv.name}>
                  {srv.name} {srv.defaultPrice ? `(R$ ${srv.defaultPrice})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Financeiro: Valor Cobrado e Forma de Pagamento */}
        <div className="grid grid-cols-2 gap-2.5 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80">
          <div>
            <label className="block text-emerald-950 text-xs font-bold mb-1">
              Valor Cobrado (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-bold text-emerald-700">R$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-emerald-300 focus:border-emerald-600 text-xs font-bold text-emerald-900 bg-white outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-emerald-950 text-xs font-bold mb-1">
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 focus:border-emerald-600 text-xs font-medium text-emerald-900 bg-white outline-none"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm.id} value={pm.id}>
                  {pm.icon} {pm.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Data e Prazo de Manutenção */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-brand-primary text-xs font-bold mb-1">
              Data do Atendimento
            </label>
            <input
              type="date"
              required
              value={performedDate}
              onChange={(e) => setPerformedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none bg-white"
            />
          </div>

          <div>
            <label className="block text-brand-primary text-xs font-bold mb-1">
              Lembrar em (dias)
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="1"
                max="180"
                required
                value={maintenanceDays}
                onChange={(e) => setMaintenanceDays(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none"
              />
              <span className="text-xs text-gray-500 font-medium">dias</span>
            </div>
          </div>
        </div>

        {/* Card informativo da previsão de retorno */}
        <div className="bg-brand-peach/40 border border-brand-peach rounded-xl p-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base">📅</span>
            <div>
              <p className="text-[10px] text-brand-text font-medium uppercase tracking-wider">
                Previsão de Retorno
              </p>
              <p className="text-xs font-bold text-brand-primary">{calculateDueDateFormatted()}</p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-brand-secondary bg-white px-2 py-0.5 rounded-lg border border-brand-peach">
            {maintenanceDays} dias
          </span>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Ficha Técnica / Anotações (opcional)
          </label>
          <input
            type="text"
            placeholder="Ex: Curvatura D, 12mm, pele sensível..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none"
          />
        </div>

        {/* Checkbox de +1 Ponto Fidelidade */}
        <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/80 cursor-pointer">
          <input
            type="checkbox"
            checked={addPoint}
            onChange={(e) => setAddPoint(e.target.checked)}
            className="w-4 h-4 text-brand-primary accent-brand-primary rounded"
          />
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-900 block">Adicionar +1 ponto no Cartão Fidelidade</span>
            <span className="text-[10px] text-amber-700">Computa automaticamente na conta da cliente</span>
          </div>
        </label>

        {/* Botões */}
        <div className="pt-1 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold text-xs hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold text-xs shadow-lg hover:bg-brand-secondary transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? <LoadingSpinner size="sm" /> : '💾 Salvar Atendimento'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ProcedureModal;
