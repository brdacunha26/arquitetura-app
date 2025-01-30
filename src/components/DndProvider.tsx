'use client';

import { ReactNode } from 'react';

interface DndProviderProps {
  children: ReactNode;
  onDragEnd: (sourceId: string, destinationId: string) => void;
}

export function DndProvider({ children, onDragEnd }: DndProviderProps) {
  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const sourceId = e.dataTransfer?.getData('text/plain');
    const target = e.target as HTMLElement;
    const destinationId = target.closest('[data-droppable-id]')?.getAttribute('data-droppable-id');

    if (sourceId && destinationId) {
      onDragEnd(sourceId, destinationId);
    }
  };

  return (
    <div
      onDragOver={(e) => handleDragOver(e as any)}
      onDrop={(e) => handleDrop(e as any)}
    >
      {children}
    </div>
  );
} 