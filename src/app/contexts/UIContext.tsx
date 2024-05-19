import React, { createContext, useContext, useState, ReactNode } from 'react';

type UIContextType = {
  theme: string;
  toggleTheme: () => void;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
};

const defaultUIContextValue: UIContextType = {
  theme: 'light',
  toggleTheme: () => {},
  isModalOpen: false,
  openModal: () => {},
  closeModal: () => {},
};

const UIContext = createContext<UIContextType>(defaultUIContextValue);

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('light');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <UIContext.Provider value={{ theme, toggleTheme, isModalOpen, openModal, closeModal }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};