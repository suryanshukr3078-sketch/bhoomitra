'use client';

import * as React from 'react';

export type ToastVariant = 'default' | 'success' | 'warning' | 'error';

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastListener = (toasts: ToastItem[]) => void;

let memoryToasts: ToastItem[] = [];
const listeners: Set<ToastListener> = new Set();

function emitChange() {
  listeners.forEach((listener) => listener([...memoryToasts]));
}

export function toast({
  title,
  description,
  variant = 'default',
  duration = 4000,
}: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).substring(2, 9);
  const newToast: ToastItem = { id, title, description, variant, duration };
  
  memoryToasts = [...memoryToasts, newToast];
  emitChange();

  if (duration > 0) {
    setTimeout(() => {
      dismissToast(id);
    }, duration);
  }

  return id;
}

export function dismissToast(id: string) {
  memoryToasts = memoryToasts.filter((t) => t.id !== id);
  emitChange();
}

export function useToast() {
  const [toasts, setToasts] = React.useState<ToastItem[]>(memoryToasts);

  React.useEffect(() => {
    listeners.add(setToasts);
    return () => {
      listeners.delete(setToasts);
    };
  }, []);

  return {
    toasts,
    toast,
    dismiss: dismissToast,
  };
}
