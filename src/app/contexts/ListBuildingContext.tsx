import React, { createContext, useContext, useState, ReactNode } from 'react';

type ListBuildingContextType = {
  currentList: any[];
  addItem: (item: any) => void;
  removeItem: (item: any) => void;
  clearList: () => void;
};

const ListBuildingContext = createContext<ListBuildingContextType | undefined>(undefined);

export const ListBuildingProvider = ({ children }: { children: ReactNode }) => {
  const [currentList, setCurrentList] = useState<any[]>([]);

  const addItem = (item: any) => setCurrentList([...currentList, item]);
  const removeItem = (item: any) => setCurrentList(currentList.filter(i => i !== item));
  const clearList = () => setCurrentList([]);

  return (
    <ListBuildingContext.Provider value={{ currentList, addItem, removeItem, clearList }}>
      {children}
    </ListBuildingContext.Provider>
  );
};

export const useListBuilding = () => {
  const context = useContext(ListBuildingContext);
  if (!context) {
    throw new Error('useListBuilding must be used within a ListBuildingProvider');
  }
  return context;
};