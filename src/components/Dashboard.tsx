import React from 'react';
import { Transaction, Appointment, Client } from '../types';
import Financials from './Financials';
import Scheduler from './Scheduler';
import Clients from './Clients';

interface DashboardProps {
  transactions: Transaction[];
  appointments: Appointment[];
  clients: Client[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction: (id: string) => void;
  onAddAppointment: (appointment: Omit<Appointment, 'id' | 'status'>) => void;
  onUpdateAppointment: (appointment: Appointment) => void;
  onDeleteAppointment: (id: string) => void;
  onUpdateAppointmentStatus: (id: string, status: 'completed' | 'canceled') => void;
  onAddClient: (client: Omit<Client, 'id' | 'completedAppointments'>) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  transactions,
  appointments,
  clients,
  onAddTransaction,
  onDeleteTransaction,
  onAddAppointment,
  onUpdateAppointment,
  onDeleteAppointment,
  onUpdateAppointmentStatus,
  onAddClient,
  onUpdateClient,
  onDeleteClient,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="lg:col-span-2">
        <Financials
          transactions={transactions}
          onAddTransaction={onAddTransaction}
          onDeleteTransaction={onDeleteTransaction}
        />
      </div>
      <div className="lg:col-span-1">
        <Scheduler
          appointments={appointments}
          onAddAppointment={onAddAppointment}
          onUpdateAppointment={onUpdateAppointment}
          onDeleteAppointment={onDeleteAppointment}
          onUpdateAppointmentStatus={onUpdateAppointmentStatus}
        />
      </div>
      <div className="lg:col-span-1">
        <Clients
          clients={clients}
          appointments={appointments}
          onAddClient={onAddClient}
          onUpdateClient={onUpdateClient}
          onDeleteClient={onDeleteClient}
        />
      </div>
    </div>
  );
};

export default Dashboard;