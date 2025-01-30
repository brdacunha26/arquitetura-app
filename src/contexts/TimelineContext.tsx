'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type TimelineEventType = 
  'TASK_CREATED' | 
  'TASK_UPDATED' | 
  'TASK_DELETED';

export interface TimelineEvent {
  id: string;
  type: TimelineEventType;
  description: string;
  date: string;
  user: string;
  changes?: { 
    field: string; 
    oldValue: string; 
    newValue: string; 
  }[];
}

interface TimelineContextType {
  events: TimelineEvent[];
  addEvent: (event: Omit<TimelineEvent, 'id'>) => void;
}

const TimelineContext = createContext<TimelineContextType>({
  events: [],
  addEvent: () => {},
});

export const TimelineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('timelineEvents');
      return savedEvents ? JSON.parse(savedEvents) : [];
    }
    return [];
  });

  const addEvent = (event: Omit<TimelineEvent, 'id'>) => {
    const newEvent = {
      ...event,
      id: crypto.randomUUID(),
      date: new Date().toISOString()
    };

    const updatedEvents = [newEvent, ...events];
    
    setEvents(updatedEvents);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('timelineEvents', JSON.stringify(updatedEvents));
    }
  };

  return (
    <TimelineContext.Provider value={{ events, addEvent }}>
      {children}
    </TimelineContext.Provider>
  );
};

export const useTimeline = () => useContext(TimelineContext);

export default TimelineContext; 