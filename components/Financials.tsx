
import React, { useState, useMemo } from 'react';
import { Transaction } from '../types';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { PlusIcon, TrashIcon } from './Icons';

interface FinancialsProps {
  transactions: Transaction[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
}

const Financials: React.FC<FinancialsProps> = ({ transactions, onAddTransaction, onDeleteTransaction }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('income');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const { income, expense, balance } = useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (description && amount && date) {
      onAddTransaction({ description, amount: parseFloat(amount), type, date });
      setDescription('');
      setAmount('');
      setType('income');
      setDate(new Date().toISOString().split('T')[0]);
      setIsModalOpen(false);
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-stone-primary">Financeiro</h2>
        <Button onClick={() => setIsModalOpen(true)} variant="primary">
          <PlusIcon />
          Adicionar
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
        <div className="p-4 bg-green-100 rounded-lg">
          <p className="text-sm text-green-700">Receita</p>
          <p className="text-lg font-bold text-green-800">{formatCurrency(income)}</p>
        </div>
        <div className="p-4 bg-red-100 rounded-lg">
          <p className="text-sm text-red-700">Despesa</p>
          <p className="text-lg font-bold text-red-800">{formatCurrency(expense)}</p>
        </div>
        <div className="p-4 bg-stone-200 rounded-lg">
          <p className="text-sm text-stone-700">Saldo</p>
          <p className="text-lg font-bold text-stone-800">{formatCurrency(balance)}</p>
        </div>
      </div>

      <h3 className="text-lg font-medium text-stone-primary mb-2">Transações Recentes</h3>
      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        {transactions.length > 0 ? (
          transactions.map(t => (
            <div key={t.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-md">
              <div>
                <p className="font-medium text-stone-800">{t.description}</p>
                <p className="text-xs text-stone-500">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
              </div>
              <div className="flex items-center gap-4">
                <p className={`font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'} {formatCurrency(t.amount)}
                </p>
                <button onClick={() => onDeleteTransaction(t.id)} className="text-stone-400 hover:text-red-500 transition-colors">
                  <TrashIcon />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-stone-500 py-4">Nenhuma transação registrada.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Adicionar Transação">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Tipo</label>
            <div className="flex gap-4">
              <button type="button" onClick={() => setType('income')} className={`w-full py-2 rounded-md ${type === 'income' ? 'bg-green-600 text-white' : 'bg-stone-200'}`}>Receita</button>
              <button type="button" onClick={() => setType('expense')} className={`w-full py-2 rounded-md ${type === 'expense' ? 'bg-red-600 text-white' : 'bg-stone-200'}`}>Despesa</button>
            </div>
          </div>
          <Input label="Descrição" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Manicure e Pedicure" required />
          <Input label="Valor (R$)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="50.00" step="0.01" required />
          <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={() => setIsModalOpen(false)} variant="secondary">Cancelar</Button>
            <Button type="submit" variant="primary">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Financials;
