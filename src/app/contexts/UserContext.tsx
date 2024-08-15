"use client";
import React, { createContext, useContext, useState, ReactNode } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
};

type UserContextType = {
  user: User;
  token: string;
  login: (userData: User, token: string) => void;
  logout: () => void;
  setUserId: (userId: string) => void;
};

const defaultGuestUser: User = {
  id: '',
  name: 'Guest',
  email: '',
};

const defaultUserContextValue: UserContextType = {
  user: defaultGuestUser,
  token: '',
  login: () => {},
  logout: () => {},
  setUserId: () => {},
};

const UserContext = createContext<UserContextType>(defaultUserContextValue);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(defaultGuestUser);
  const [token, setToken] = useState<string>('');

  const login = (userData: User, jwtToken: string) => {
    setUser(userData);
    setToken(jwtToken);
  };

  const logout = () => {
    setUser(defaultGuestUser);
    setToken('');
  };

  const setUserId = (userId: string) => {
    setUser((prevUser) => prevUser ? { ...prevUser, id: userId } : defaultGuestUser);
  };

  return (
    <UserContext.Provider value={{ user, token, login, logout, setUserId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};