import React, { useState } from 'react';
import { Client, Appointment } from '../types';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { PlusIcon, TrashIcon, PencilIcon, UsersIcon, ChevronDownIcon } from './Icons';

interface ClientsProps {
  clients: Client[];
  appointments: Appointment[];
  onAddClient: (client: Omit<Client, 'id' | 'completedAppointments'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const Clients: React.FC<ClientsProps> = ({ clients, appointments, onAddClient, onUpdateClient, onDeleteClient }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);

  const toggleHistory = (clientId: string) => {
    setExpandedClientId(prevId => (prevId === clientId ? null : clientId));
  };

  const resetForm = () => {
    setName('');
    setPhone('');
    setNotes('');
    setEditingClient(null);
  };

  const handleOpenModal = (client: Client | null = null) => {
    if (client) {
      setEditingClient(client);
      setName(client.name);
      setPhone(client.phone || '');
      setNotes(client.notes || '');
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name) {
      const clientData = { name, phone, notes };
      if (editingClient) {
        onUpdateClient({ ...editingClient, ...clientData });
      } else {
        onAddClient(clientData);
      }
      handleCloseModal();
    }
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-stone-primary flex items-center gap-2">
            <UsersIcon />
            Clientes
        </h2>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <PlusIcon />
          Adicionar
        </Button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto pr-2">
        {clients.length > 0 ? (
          clients.map(c => {
            const isExpanded = expandedClientId === c.id;
            const clientHistory = appointments
                .filter(app => app.status === 'completed' && app.clientName.toLowerCase() === c.name.toLowerCase())
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            
            return (
                <div key={c.id} className="p-3 bg-stone-50 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 mb-2 sm:mb-0">
                    <p className="font-medium text-stone-800">{c.name}</p>
                    <p className="text-sm text-stone-600">{c.phone}</p>
                    {c.notes && <p className="text-xs text-stone-500 mt-1 italic">Obs: {c.notes}</p>}
                    <div className="mt-2">
                        <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-beige-medium text-beige-dark">
                            {c.completedAppointments} {c.completedAppointments === 1 ? 'serviço concluído' : 'serviços concluídos'}
                        </span>
                    </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        <button onClick={() => handleOpenModal(c)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Editar">
                            <PencilIcon />
                        </button>
                        <button onClick={() => onDeleteClient(c.id)} className="p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Excluir">
                            <TrashIcon />
                        </button>
                        {clientHistory.length > 0 && (
                            <button onClick={() => toggleHistory(c.id)} className="p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Ver Histórico">
                                <ChevronDownIcon className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                    </div>
                </div>

                {isExpanded && clientHistory.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-stone-200 animate-fade-in">
                        <h4 className="text-sm font-semibold text-stone-700 mb-2">Histórico de Serviços</h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {clientHistory.map(app => (
                            <div key={app.id} className="flex justify-between items-center text-xs p-2 bg-white rounded">
                                <div>
                                    <p className="font-medium text-stone-800">{app.service}</p>
                                    <p className="text-stone-500">{new Date(app.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                                </div>
                                <p className="font-semibold text-green-700">{formatCurrency(app.price)}</p>
                            </div>
                            ))}
                        </div>
                    </div>
                )}
                </div>
            )
          })
        ) : (
          <p className="text-center text-stone-500 py-4">Nenhum cliente cadastrado.</p>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingClient ? "Editar Cliente" : "Adicionar Cliente"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome da Cliente" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Maria da Silva" required />
          <Input label="Telefone (Opcional)" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(XX) XXXXX-XXXX" />
          <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Observações (Opcional)</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: Alergia a esmalte vermelho"
                className="w-full px-3 py-2 border border-stone-300 rounded-md shadow-sm placeholder-stone-400 focus:outline-none focus:ring-1 focus:ring-stone-primary focus:border-stone-primary"
                rows={3}
              ></textarea>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" onClick={handleCloseModal} variant="secondary">Cancelar</Button>
            <Button type="submit" variant="primary">Salvar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Clients;