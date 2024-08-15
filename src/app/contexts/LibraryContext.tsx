"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import supabase from "../utils/supabaseClient";
import toast from "react-hot-toast";
import { useUser } from './UserContext'; // Import useUser for accessing user data

interface LibraryItem {
  id: string;
  title: string;
  cover: string;
  creator: string;
  [key: string]: any; // Additional properties for library items
}

interface LibraryContextType {
  libraryItems: LibraryItem[];
  addItemToLibrary: (item: LibraryItem) => Promise<void>;
  removeItemFromLibrary: (itemId: string) => Promise<void>;
  fetchLibraryItems: () => Promise<void>;
}

const defaultLibraryContextValue: LibraryContextType = {
  libraryItems: [],
  addItemToLibrary: async () => {},
  removeItemFromLibrary: async () => {},
  fetchLibraryItems: async () => {},
};

const LibraryContext = createContext<LibraryContextType>(defaultLibraryContextValue);

export const LibraryProvider = ({ children }: { children: ReactNode }) => {
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>([]);
  const { user } = useUser(); // Get user from UserContext

  const addItemToLibrary = async (item: LibraryItem) => {
    if (!user) {
      toast.error("Log in to add to Library");
      return;
    }

    const { data: existingItem, error: existingItemError } = await supabase
      .from("library")
      .select("*")
      .eq("user_id", user.id);

    let isInUserLibrary = false;
    if (existingItem) {
      const filtered = existingItem.filter((libItem) => libItem.item_id === item.id);
      if (filtered.length > 0) {
        isInUserLibrary = true;
        toast.error("Already in Library!");
        return;
      }
    } else if (existingItemError) {
      console.log(existingItemError);
    }

    if (!isInUserLibrary) {
      const { error } = await supabase.from("library").insert({
        item_id: item.id,
        user_id: user.id,
        ...item, // Include other item properties
      });
      if (error) {
        console.log(error);
      } else {
        setLibraryItems((prevItems) => [...prevItems, item]);
        toast.success("Added to Library!");
      }
    }
  };

  const removeItemFromLibrary = async (itemId: string) => {
    if (!user) {
      toast.error("Log in to remove from Library");
      return;
    }

    const { error } = await supabase.from("library").delete().eq("item_id", itemId).eq("user_id", user.id);
    if (error) {
      console.log(error);
    } else {
      setLibraryItems((prevItems) => prevItems.filter(item => item.id !== itemId));
      toast.success("Removed from Library!");
    }
  };

  const fetchLibraryItems = async () => {
    if (!user) {
      toast.error("Log in to view your Library");
      return;
    }

    const { data, error } = await supabase.from("library").select("*").eq("user_id", user.id);
    if (error) {
      console.log(error);
    } else {
      setLibraryItems(data || []);
    }
  };

  return (
    <LibraryContext.Provider value={{ libraryItems, addItemToLibrary, removeItemFromLibrary, fetchLibraryItems }}>
      {children}
    </LibraryContext.Provider>
  );
};

export const useLibrary = () => {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
};