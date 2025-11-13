export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  date: string;
}

export interface Appointment {
  id: string;
  clientName: string;
  service: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'canceled';
  price: number;
}

export interface Client {
  id: string;
  name: string;
  phone?: string;
  notes?: string;
  completedAppointments: number;
}
