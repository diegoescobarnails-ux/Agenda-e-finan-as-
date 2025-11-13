import React, { useState, useEffect } from 'react';
import { Transaction, Appointment, Client } from './types';
import Header from './components/Header';
import Dashboard from './components/Dashboard';

const App: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      const storedAppointments = localStorage.getItem('appointments');
      if (storedAppointments) {
        setAppointments(JSON.parse(storedAppointments));
      }
      const storedClients = localStorage.getItem('clients');
      if (storedClients) {
        setClients(JSON.parse(storedClients));
      }
    } catch (error) {
      console.error("Failed to parse data from localStorage", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('transactions', JSON.stringify(transactions));
    } catch (error) {
      console.error("Failed to save transactions to localStorage", error);
    }
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem('appointments', JSON.stringify(appointments));
    } catch (error) {
      console.error("Failed to save appointments to localStorage", error);
    }
  }, [appointments]);

  useEffect(() => {
    try {
        localStorage.setItem('clients', JSON.stringify(clients));
    } catch (error) {
        console.error("Failed to save clients to localStorage", error);
    }
  }, [clients]);


  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = { ...transaction, id: crypto.randomUUID() };
    setTransactions(prev => [...prev, newTransaction].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addAppointment = (appointment: Omit<Appointment, 'id' | 'status'>) => {
    const newAppointment: Appointment = { ...appointment, id: crypto.randomUUID(), status: 'scheduled' };
    setAppointments(prev => [...prev, newAppointment].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()));
  };
  
  const updateAppointmentStatus = (id: string, status: 'completed' | 'canceled') => {
      const appointment = appointments.find(app => app.id === id);
      if (!appointment) return;

      if (status === 'completed' && appointment.status !== 'completed') {
        // Add income transaction
        addTransaction({
          description: `Serviço: ${appointment.service} - ${appointment.clientName}`,
          amount: appointment.price,
          type: 'income',
          date: appointment.date,
        });

        // Update client appointment count
        setClients(prevClients => {
            const clientIndex = prevClients.findIndex(c => c.name.toLowerCase() === appointment.clientName.toLowerCase());
            if (clientIndex > -1) {
                const updatedClients = [...prevClients];
                const updatedClient = { ...updatedClients[clientIndex], completedAppointments: updatedClients[clientIndex].completedAppointments + 1 };
                updatedClients[clientIndex] = updatedClient;
                return updatedClients;
            } else {
                const newClient: Client = {
                    id: crypto.randomUUID(),
                    name: appointment.clientName,
                    completedAppointments: 1,
                    phone: '',
                    notes: '',
                };
                return [...prevClients, newClient];
            }
        });
      }
      
      setAppointments(prev => prev.map(app => app.id === id ? {...app, status} : app));
  };

  const updateAppointment = (updatedAppointment: Appointment) => {
    setAppointments(prev => 
        prev.map(app => (app.id === updatedAppointment.id ? updatedAppointment : app))
            .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime())
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const addClient = (client: Omit<Client, 'id' | 'completedAppointments'>) => {
    const newClient: Client = {
        ...client,
        id: crypto.randomUUID(),
        completedAppointments: 0,
    };
    setClients(prev => [...prev, newClient].sort((a, b) => a.name.localeCompare(b.name)));
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => prev.map(c => c.id === updatedClient.id ? updatedClient : c)
        .sort((a, b) => a.name.localeCompare(b.name))
    );
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  };


  return (
    <div className="min-h-screen bg-stone-100 text-stone-800 font-sans">
      <Header />
      <main className="p-4 sm:p-6 md:p-8">
        <Dashboard
          transactions={transactions}
          appointments={appointments}
          clients={clients}
          onAddTransaction={addTransaction}
          onDeleteTransaction={deleteTransaction}
          onAddAppointment={addAppointment}
          onUpdateAppointment={updateAppointment}
          onDeleteAppointment={deleteAppointment}
          onUpdateAppointmentStatus={updateAppointmentStatus}
          onAddClient={addClient}
          onUpdateClient={updateClient}
          onDeleteClient={deleteClient}
        />
      </main>
    </div>
  );
};

export default App;