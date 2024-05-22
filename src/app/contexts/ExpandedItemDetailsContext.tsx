"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ItemDetails {
  id: string;
  title: string;
  cover: string;
  creator: string;
  subtitle?: string;
  [key: string]: any; // Additional properties for different media types
}

interface ExpandedItemDetailsContextType {
  itemDetails: ItemDetails;
  setItemDetails: (details: ItemDetails) => void;
  clearItemDetails: () => void;
}

const defaultItemDetails: ItemDetails = {
  id: '',
  title: '',
  cover: '',
  creator: '',
  subtitle: '',
};

const ExpandedItemDetailsContext = createContext<ExpandedItemDetailsContextType>({
  itemDetails: defaultItemDetails,
  setItemDetails: () => {},
  clearItemDetails: () => {},
});

export const ExpandedItemDetailsProvider = ({ children }: { children: ReactNode }) => {
  const [itemDetails, setItemDetailsState] = useState<ItemDetails>(defaultItemDetails);

  const setItemDetails = (details: ItemDetails) => {
    setItemDetailsState(details);
    console.log(details);
  };

  const clearItemDetails = () => {
    setItemDetailsState(defaultItemDetails);
  };

  return (
    <ExpandedItemDetailsContext.Provider value={{ itemDetails, setItemDetails, clearItemDetails }}>
      {children}
    </ExpandedItemDetailsContext.Provider>
  );
};

export const useExpandedItemDetails = () => {
  const context = useContext(ExpandedItemDetailsContext);
  if (!context) {
    throw new Error('useExpandedItemDetails must be used within an ExpandedItemDetailsProvider');
  }
  return context;
};