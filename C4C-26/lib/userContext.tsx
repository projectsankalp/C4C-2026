"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, SustainabilityResult, calculateSustainability } from './scoreEngine';

interface UserContextType {
  profile: UserProfile | null;
  result: SustainabilityResult | null;
  updateProfile: (profile: UserProfile) => void;
  resetProfile: () => void;
  isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [result, setResultState] = useState<SustainabilityResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load profile from localStorage on mount
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('groundwater_profile');
      if (stored) {
        try {
          const parsed: UserProfile = JSON.parse(stored);
          setProfileState(parsed);
          setResultState(calculateSustainability(parsed));
        } catch (e) {
          console.error("Failed to parse stored profile:", e);
        }
      }
      setIsLoading(false);
    }
  }, []);

  const updateProfile = (newProfile: UserProfile) => {
    setProfileState(newProfile);
    const calculatedResult = calculateSustainability(newProfile);
    setResultState(calculatedResult);
    if (typeof window !== 'undefined') {
      localStorage.setItem('groundwater_profile', JSON.stringify(newProfile));
    }
  };

  const resetProfile = () => {
    setProfileState(null);
    setResultState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('groundwater_profile');
    }
  };

  return (
    <UserContext.Provider value={{ profile, result, updateProfile, resetProfile, isLoading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
export default UserContext;
