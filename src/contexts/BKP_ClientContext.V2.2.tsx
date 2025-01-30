'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
}

export interface ClientEvent {
  id: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  clientId: string;
  clientName: string;
  description: string;
  changes?: {
    field: string;
    oldValue?: string;
    newValue?: string;
  }[];
  timestamp: string;
}

interface ClientContextType {
  clients: Client[];
  clientEvents: ClientEvent[];
  setClients: React.Dispatch<React.SetStateAction<Client[]>>;
  selectedClient: Client | null;
  setSelectedClient: React.Dispatch<React.SetStateAction<Client | null>>;
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
  getClientById: (clientId: string) => Client | undefined;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

// Dados mock iniciais
const initialClients: Client[] = [
  {
    id: 'client1',
    name: 'João Silva',
    email: 'joao.silva@email.com',
    phone: '(11) 98765-4321',
    address: 'Rua das Flores, 123 - São Paulo, SP',
    createdAt: '2024-01-01',
  },
  {
    id: 'client2',
    name: 'Maria Santos',
    email: 'maria.santos@email.com',
    phone: '(11) 91234-5678',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    createdAt: '2024-02-01',
  },
];

export function ClientProvider({ children }: { children: ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [clientEvents, setClientEvents] = useState<ClientEvent[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const addClientEvent = (event: Omit<ClientEvent, 'id' | 'timestamp'>) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
    };
    setClientEvents(prev => [newEvent, ...prev]);
  };

  const addClient = (client: Omit<Client, 'id' | 'createdAt'>) => {
    const newClient = {
      ...client,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setClients(prev => [...prev, newClient]);
    addClientEvent({
      type: 'CREATE',
      clientId: newClient.id,
      clientName: newClient.name,
      description: `Cliente ${newClient.name} foi criado`,
      changes: [
        { field: 'Nome', newValue: newClient.name },
        { field: 'E-mail', newValue: newClient.email },
        { field: 'Telefone', newValue: newClient.phone },
        { field: 'Endereço', newValue: newClient.address },
      ],
    });
  };

  const updateClient = (client: Client) => {
    const oldClient = clients.find(c => c.id === client.id);
    setClients(prev => prev.map(c => c.id === client.id ? client : c));
    
    if (oldClient) {
      const changes = [];
      
      if (oldClient.name !== client.name) {
        changes.push({ field: 'Nome', oldValue: oldClient.name, newValue: client.name });
      }
      if (oldClient.email !== client.email) {
        changes.push({ field: 'E-mail', oldValue: oldClient.email, newValue: client.email });
      }
      if (oldClient.phone !== client.phone) {
        changes.push({ field: 'Telefone', oldValue: oldClient.phone, newValue: client.phone });
      }
      if (oldClient.address !== client.address) {
        changes.push({ field: 'Endereço', oldValue: oldClient.address, newValue: client.address });
      }

      addClientEvent({
        type: 'UPDATE',
        clientId: client.id,
        clientName: client.name,
        description: `Cliente ${client.name} foi atualizado`,
        changes,
      });
    }
  };

  const deleteClient = (clientId: string) => {
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setClients(prev => prev.filter(c => c.id !== clientId));
      addClientEvent({
        type: 'DELETE',
        clientId: client.id,
        clientName: client.name,
        description: `Cliente ${client.name} foi excluído`,
        changes: [
          { field: 'Nome', oldValue: client.name },
          { field: 'E-mail', oldValue: client.email },
          { field: 'Telefone', oldValue: client.phone },
          { field: 'Endereço', oldValue: client.address },
        ],
      });
    }
  };

  const getClientById = (clientId: string) => {
    return clients.find(c => c.id === clientId);
  };

  return (
    <ClientContext.Provider value={{
      clients,
      clientEvents,
      setClients,
      selectedClient,
      setSelectedClient,
      addClient,
      updateClient,
      deleteClient,
      getClientById,
    }}>
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error('useClientContext must be used within a ClientProvider');
  }
  return context;
} 