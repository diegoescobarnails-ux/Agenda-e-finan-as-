import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import Modal from './Modal';
import Button from './Button';
import Input from './Input';
import { PlusIcon, TrashIcon, CheckIcon, XIcon, PencilIcon } from './Icons';
import CalendarView from './CalendarView';

interface SchedulerProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateAppointmentStatus: (id: string, status: 'completed' | 'canceled') => void;
}

const Scheduler: React.FC<SchedulerProps> = ({ appointments, onAddAppointment, onUpdateAppointment, onDeleteAppointment, onUpdateAppointmentStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [service, setService] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [view, setView] = useState<'upcoming' | 'history' | 'calendar'>('upcoming');

  const { upcomingAppointments, historyAppointments } = useMemo(() => {
    const upcoming = appointments.filter(a => a.status === 'scheduled')
      .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
    const history = appointments.filter(a => a.status !== 'scheduled')
      .sort((a, b) => new Date(`${b.date}T${b.time}`).getTime() - new Date(`${a.date}T${a.time}`).getTime());
    return { upcomingAppointments: upcoming, historyAppointments: history };
  }, [appointments]);

  const displayedAppointments = view === 'upcoming' ? upcomingAppointments : historyAppointments;

  const resetForm = () => {
    setClientName('');
    setService('');
    setDate(new Date().toISOString().split('T')[0]);
    setTime('');
    setPrice('');
    setEditingAppointment(null);
  };

  const handleOpenModal = (appointment: Appointment | null = null) => {
    if (appointment) {
      setEditingAppointment(appointment);
      setClientName(appointment.clientName);
      setService(appointment.service);
      setDate(appointment.date);
      setTime(appointment.time);
      setPrice(String(appointment.price));
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
    if (clientName && service && date && time && price) {
      const appointmentData = { clientName, service, date, time, price: parseFloat(price) };
      if (editingAppointment) {
        onUpdateAppointment({ ...editingAppointment, ...appointmentData });
      } else {
        onAddAppointment(appointmentData);
      }
      handleCloseModal();
    }
  };
  
  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
        case 'scheduled': return 'bg-blue-100 text-blue-800';
        case 'completed': return 'bg-green-100 text-green-800';
        case 'canceled': return 'bg-red-100 text-red-800';
    }
  }
  
  const getStatusText = (status: Appointment['status']) => {
    switch(status) {
        case 'scheduled': return 'Agendado';
        case 'completed': return 'Concluído';
        case 'canceled': return 'Cancelado';
    }
  }

  const formatCurrency = (value: number) => {
    return (value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-stone-primary">Agenda</h2>
        <Button onClick={() => handleOpenModal()} variant="primary">
          <PlusIcon />
          Agendar
        </Button>
      </div>

      <div className="border-b border-stone-200 mb-4">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setView('upcoming')}
            className={`${view === 'upcoming' ? 'border-stone-primary text-stone-primary' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Próximos
          </button>
          <button
            onClick={() => setView('history')}
            className={`${view === 'history' ? 'border-stone-primary text-stone-primary' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Histórico
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`${view === 'calendar' ? 'border-stone-primary text-stone-primary' : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'} whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Calendário
          </button>
        </nav>
      </div>
      
      {view === 'calendar' ? (
        <CalendarView 
            appointments={appointments}
            onDeleteAppointment={onDeleteAppointment}
            onUpdateAppointmentStatus={onUpdateAppointmentStatus}
            onEditAppointment={handleOpenModal}
        />
      ) : (
        <div className="space-y-3 flex-1 overflow-y-auto pr-2">
            {displayedAppointments.length > 0 ? (
            displayedAppointments.map(a => (
                <div key={a.id} className="p-3 bg-stone-50 rounded-md">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1 mb-2 sm:mb-0">
                        <div className="flex items-center gap-3">
                            <p className="font-medium text-stone-800">{a.clientName}</p>
                            { a.status !== 'scheduled' && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(a.status)}`}>
                                    {getStatusText(a.status)}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-stone-600">{a.service} - <span className="font-semibold">{formatCurrency(a.price)}</span></p>
                        <p className="text-xs text-stone-500">
                        {new Date(a.date).toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', timeZone: 'UTC' })} às {a.time}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center">
                        { a.status === 'scheduled' && (
                            <>
                                <button onClick={() => onUpdateAppointmentStatus(a.id, 'completed')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Concluir">
                                <CheckIcon />
                                </button>
                                <button onClick={() => onUpdateAppointmentStatus(a.id, 'canceled')} className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors" title="Cancelar">
                                <XIcon />
                                </button>
                                <button onClick={() => handleOpenModal(a)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Editar">
                                <PencilIcon />
                                </button>
                            </>
                        )}
                        <button onClick={() => onDeleteAppointment(a.id)} className="p-2 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 transition-colors" title="Excluir">
                        <TrashIcon />
                        </button>
                    </div>
                </div>
                </div>
            ))
            ) : (
            <p className="text-center text-stone-500 py-4">
                {view === 'upcoming' ? 'Nenhum agendamento futuro.' : 'Nenhum registro no histórico.'}
            </p>
            )}
        </div>
      )}

       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingAppointment ? "Editar Agendamento" : "Novo Agendamento"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nome da Cliente" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Maria da Silva" required />
          <Input label="Serviço" value={service} onChange={e => setService(e.target.value)} placeholder="Ex: Manicure e Pedicure" required />
          <Input label="Preço (R$)" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="50.00" step="0.01" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Data" type="date" value={date} onChange={e => setDate(e.target.value)} required />
            <Input label="Hora" type="time" value={time} onChange={e => setTime(e.target.value)} required />
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

export default Scheduler;