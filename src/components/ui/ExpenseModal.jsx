import React, { useState } from 'react';
import Modal from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { createExpense } from '../../services/financeService';
import { useAuth } from '../../hooks/useAuth';

const EXPENSE_CATEGORIES = [
  'Materiais & Produtos',
  'Aluguel / Contas',
  'Marketing / Tráfego',
  'Equipamentos',
  'Cursos & Especialização',
  'Outro',
];

/**
 * Modal para lançamento de despesas/gastos do estúdio.
 */
const ExpenseModal = ({ isOpen, onClose, onExpenseSaved }) => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!description.trim() || !amount) {
      setError('Preencha a descrição e o valor da despesa.');
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = date.split('-').map(Number);
      const expDate = new Date(year, month - 1, day, 12, 0, 0);

      const newExpense = await createExpense({
        description: description.trim(),
        amount: Number(amount) || 0,
        category,
        date: expDate,
        adminId: user?.uid,
      });

      setDescription('');
      setAmount('');
      if (onExpenseSaved) onExpenseSaved(newExpense);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao salvar despesa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Lançar Despesa / Gasto">
      <form onSubmit={handleSubmit} className="space-y-4 animate-slideUp">
        {error && (
          <div className="bg-red-50 text-red-600 border border-red-200 text-xs p-3 rounded-xl">
            {error}
          </div>
        )}

        {/* Descrição */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Descrição do Gasto *
          </label>
          <input
            type="text"
            required
            placeholder="Ex: Compra de caixas de cílios e cola"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none"
          />
        </div>

        {/* Valor e Data */}
        <div className="grid grid-cols-2 gap-2.5">
          <div>
            <label className="block text-brand-primary text-xs font-bold mb-1">
              Valor (R$) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs font-bold text-red-500">R$</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:border-brand-accent text-xs font-bold text-red-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-brand-primary text-xs font-bold mb-1">
              Data do Pagamento
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-brand-accent text-xs outline-none bg-white"
            />
          </div>
        </div>

        {/* Categoria */}
        <div>
          <label className="block text-brand-primary text-xs font-bold mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-brand-accent text-xs bg-white outline-none"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
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
            className="flex-1 py-3 rounded-xl bg-red-600 text-white font-bold text-xs shadow-lg hover:bg-red-700 transition-all flex items-center justify-center gap-1.5"
          >
            {loading ? <LoadingSpinner size="sm" /> : '💸 Salvar Gasto'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default ExpenseModal;
