import React, { useState } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { createClientManually } from '../../services/fidelityService';
import { useAuth } from '../../hooks/useAuth';

/**
 * Modal para cadastro manual de cliente pela Administradora.
 */
const CreateClientModal = ({ isOpen, onClose, onClientCreated }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [initialPoints, setInitialPoints] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Aplica máscara de telefone (XX) XXXXX-XXXX
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhoneNumber(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Por favor, informe o nome da cliente.');
      return;
    }

    const rawDigits = phoneNumber.replace(/\D/g, '');
    if (rawDigits.length < 10) {
      setError('Informe um número de WhatsApp válido com DDD (ex: 21 99999-9999).');
      return;
    }

    setLoading(true);
    try {
      const newClient = await createClientManually({
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        adminId: user?.uid,
        initialPoints: Number(initialPoints) || 0,
      });

      setName('');
      setPhoneNumber('');
      setInitialPoints(0);
      if (onClientCreated) onClientCreated(newClient);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao cadastrar cliente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cadastrar Nova Cliente">
      <form onSubmit={handleSubmit} className="space-y-4 animate-slideUp">
        <p className="text-brand-text text-xs">
          Cadastre os dados da cliente para gerenciar lembretes de retorno e cartão fidelidade.
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Nome */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Camila Silva"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-sm outline-none transition-all"
          />
        </div>

        {/* Telefone / WhatsApp */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            WhatsApp / Celular *
          </label>
          <input
            type="tel"
            required
            placeholder="(21) 99999-9999"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent focus:ring-1 focus:ring-brand-accent text-sm outline-none transition-all"
          />
          <span className="text-[10px] text-gray-400 mt-0.5 block">
            Usado para enviar mensagens com 1 clique.
          </span>
        </div>

        {/* Pontos Iniciais de Fidelidade */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Pontos no Cartão Fidelidade (opcional)
          </label>
          <div className="flex items-center gap-2">
            {[0, 1, 2, 3].map((pt) => (
              <button
                key={pt}
                type="button"
                onClick={() => setInitialPoints(pt)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-all ${
                  initialPoints === pt
                    ? 'bg-brand-primary text-white border-brand-primary shadow-sm'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                {pt === 0 ? 'Zero' : `${pt} pt${pt > 1 ? 's' : ''}`}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 flex gap-2">
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
            {loading ? <LoadingSpinner size="sm" /> : '✨ Salvar Cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateClientModal;
