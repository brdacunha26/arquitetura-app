'use client';

import { createContext, useContext, useState } from 'react';

export interface Client {
  id: string;
  name: string;
  birthDate: string;
  cpf: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone?: string;
  email?: string;
}

interface ClientContextType {
  clients: Client[];
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (client: Client) => void;
  deleteClient: (clientId: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

const initialClients: Client[] = [
  {
    id: '1',
    name: 'João Silva',
    birthDate: '1985-05-15',
    cpf: '123.456.789-00',
    address: {
      street: 'Rua Principal',
      number: '100',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000'
    },
    phone: '(11) 98765-4321',
    email: 'joao.silva@email.com'
  }
];

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [clients, setClients] = useState<Client[]>(initialClients);

  const addClient = (client: Omit<Client, 'id'>) => {
    const newClient = {
      ...client,
      id: crypto.randomUUID()
    };
    setClients(prev => [...prev, newClient]);
  };

  const updateClient = (updatedClient: Client) => {
    setClients(prev => 
      prev.map(client => 
        client.id === updatedClient.id ? updatedClient : client
      )
    );
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(client => client.id !== clientId));
  };

  return (
    <ClientContext.Provider value={{
      clients,
      addClient,
      updateClient,
      deleteClient
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