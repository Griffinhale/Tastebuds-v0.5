"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { fetchBooks, fetchAlbums, fetchVideos, fetchGames, fetchLibraryResults } from '../utils/searchUtils';

type SearchResult = {
  id: string;
  title: string;
  cover: string;
  type: string;
  // Add other relevant fields
};

type SearchContextType = {
  searchQuery: string;
  searchResults: SearchResult[];
  isLoading: boolean;
  page: number;
  endOfResults: boolean;
  category: string;
  term: string;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setPage: (page: number) => void;
  setEndOfResults: (endOfResults: boolean) => void;
  setCategory: (category: string) => void;
  setTerm: (term: string) => void;
  search: (query: string, page: number, category: string) => Promise<void>;
};

const defaultSearchContextValue: SearchContextType = {
  searchQuery: '',
  searchResults: [],
  isLoading: false,
  page: 0,
  endOfResults: false,
  category: 'Your Library',
  term: '',
  setSearchQuery: () => {},
  setSearchResults: () => {},
  setIsLoading: () => {},
  setPage: () => {},
  setEndOfResults: () => {},
  setCategory: () => {},
  setTerm: () => {},
  search: async () => {},
};

const SearchContext = createContext<SearchContextType>(defaultSearchContextValue);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [endOfResults, setEndOfResults] = useState<boolean>(false);
  const [category, setCategory] = useState<string>('Your Library');
  const [term, setTerm] = useState<string>('');

  const search = async (query: string, page: number, category: string) => {
    setIsLoading(true);
    setEndOfResults(false);
    let results: SearchResult[] = [];

    try {
      switch (category) {
        case 'Books':
          results = await fetchBooks(query, page);
          break;
        case 'Albums':
          results = await fetchAlbums(query, page);
          break;
        case 'Videos':
          results = await fetchVideos(query, page);
          break;
        case 'Games':
          results = await fetchGames(query, page);
          break;
        case 'Your Library':
          results = await fetchLibraryResults(query);
          break;
        default:
          results = [];
      }

      if (results.length === 0) {
        setEndOfResults(true);
      } else {
        setSearchResults((prevResults) => {
          const uniqueData = results.filter(
            (d) => !prevResults.some((p) => p.id === d.id)
          );
          return [...prevResults, ...uniqueData];
        });
      }
    } catch (error) {
      console.error("Error fetching data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        searchResults,
        isLoading,
        page,
        endOfResults,
        category,
        term,
        setSearchQuery,
        setSearchResults,
        setIsLoading,
        setPage,
        setEndOfResults,
        setCategory,
        setTerm,
        search,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};