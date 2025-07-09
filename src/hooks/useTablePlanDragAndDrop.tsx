
import { useState } from 'react';
import { useTableOperations } from './useTableOperations';

export const useTablePlanDragAndDrop = () => {
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [draggedTable, setDraggedTable] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const { updateTablePosition } = useTableOperations();

  const handleTableClick = (tableId: string) => {
    if (!isDragging) {
      setSelectedTable(selectedTable === tableId ? null : tableId);
    }
  };

  const handleDragStart = (e: React.DragEvent, tableId: string, canModify: boolean) => {
    if (!canModify) {
      e.preventDefault();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setDragOffset({ x, y });
    setDraggedTable(tableId);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTable(null);
    setIsDragging(false);
    setTimeout(() => setIsDragging(false), 100);
  };

  const handleDragOver = (e: React.DragEvent, canModify: boolean) => {
    if (!canModify) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, canModify: boolean, planRef: React.RefObject<HTMLDivElement>) => {
    if (!canModify || !draggedTable || !planRef.current) return;
    
    e.preventDefault();
    const rect = planRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left - dragOffset.x, rect.width - 80));
    const y = Math.max(0, Math.min(e.clientY - rect.top - dragOffset.y, rect.height - 80));

    console.log(`Déplacement de la table ${draggedTable} vers (${x}, ${y})`);
    await updateTablePosition(draggedTable, x, y);
  };

  return {
    selectedTable,
    draggedTable,
    isDragging,
    setSelectedTable,
    handleTableClick,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop
  };
};
