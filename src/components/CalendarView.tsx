import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import { TrashIcon, CheckIcon, XIcon, PencilIcon } from './Icons';

interface CalendarViewProps {
  appointments: Appointment[];
  onEditAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateAppointmentStatus: (id: string, status: 'completed' | 'canceled') => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ appointments, onEditAppointment, onDeleteAppointment, onUpdateAppointmentStatus }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(new Date());

    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

    const appointmentsByDate = useMemo(() => {
        const map = new Map<string, Appointment[]>();
        appointments.forEach(app => {
            const dateKey = app.date; // YYYY-MM-DD
            if (!map.has(dateKey)) {
                map.set(dateKey, []);
            }
            map.get(dateKey)!.push(app);
        });
        return map;
    }, [appointments]);

    const selectedDayAppointments = useMemo(() => {
        const dateKey = selectedDate.toISOString().split('T')[0];
        return (appointmentsByDate.get(dateKey) || []).sort((a,b) => a.time.localeCompare(b.time));
    }, [selectedDate, appointmentsByDate]);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const startingDayOfWeek = firstDayOfMonth.getDay(); 
    const blanks = Array.from({ length: startingDayOfWeek }, (_, i) => i);
    const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
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
        <div className="flex flex-col h-full">
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2 px-2">
                    <button onClick={handlePrevMonth} className="p-1 rounded-full hover:bg-stone-100 transition-colors">&lt;</button>
                    <h3 className="font-semibold text-stone-700 text-sm">
                        {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' }).toLocaleUpperCase()}
                    </h3>
                    <button onClick={handleNextMonth} className="p-1 rounded-full hover:bg-stone-100 transition-colors">&gt;</button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500">
                    {weekDays.map(day => <div key={day} className="py-1">{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-1 mt-1">
                    {blanks.map(b => <div key={`blank-${b}`}></div>)}
                    {days.map(day => {
                        const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                        const dateKey = dayDate.toISOString().split('T')[0];
                        const isToday = new Date().toISOString().split('T')[0] === dateKey;
                        const isSelected = selectedDate.toISOString().split('T')[0] === dateKey;
                        const hasAppointments = appointmentsByDate.has(dateKey);

                        return (
                            <div key={day} className="flex justify-center items-center">
                                <button 
                                    onClick={() => setSelectedDate(dayDate)}
                                    className={`h-8 w-8 rounded-full flex items-center justify-center relative transition-colors text-sm
                                        ${isSelected ? 'bg-stone-primary text-white' : isToday ? 'bg-stone-200' : 'hover:bg-stone-100'}
                                    `}
                                >
                                    {day}
                                    {hasAppointments && <span className={`absolute bottom-1.5 h-1 w-1 rounded-full ${isSelected ? 'bg-white' : 'bg-stone-primary'}`}></span>}
                                </button>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 -mr-2">
                <h4 className="font-medium mb-2 text-stone-600 border-t pt-4">
                    Agenda para {selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}
                </h4>
                {selectedDayAppointments.length > 0 ? (
                    <div className="space-y-3">
                        {selectedDayAppointments.map(a => (
                            <div key={a.id} className="p-3 bg-stone-50 rounded-md">
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="flex-1 mb-2 sm:mb-0">
                                        <div className="flex items-center gap-3">
                                            <p className="font-medium text-stone-800">{a.clientName}</p>
                                            {a.status !== 'scheduled' && (
                                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusBadge(a.status)}`}>
                                                    {getStatusText(a.status)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-stone-600">{a.service} - <span className="font-semibold">{formatCurrency(a.price)}</span></p>
                                        <p className="text-xs text-stone-500">
                                            Às {a.time}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 self-end sm:self-center">
                                        {a.status === 'scheduled' && (
                                            <>
                                                <button onClick={() => onUpdateAppointmentStatus(a.id, 'completed')} className="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors" title="Concluir">
                                                    <CheckIcon />
                                                </button>
                                                <button onClick={() => onUpdateAppointmentStatus(a.id, 'canceled')} className="p-2 rounded-full bg-orange-100 text-orange-600 hover:bg-orange-200 transition-colors" title="Cancelar">
                                                    <XIcon />
                                                </button>
                                                <button onClick={() => onEditAppointment(a)} className="p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors" title="Editar">
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
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-stone-500 py-4">Nenhum agendamento para este dia.</p>
                )}
            </div>
        </div>
    )
}

export default CalendarView;