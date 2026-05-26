/**
 * src/hooks/useFamily.js
 * Custom hook to consume family-related state and functions from Patient Context.
 */

import { useContext } from 'react';
import { PatientContext } from '../context/PatientContext';

export default function useFamily() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('useFamily must be used within a PatientProvider');
  }

  const { familyMembers, switchProfile, linkFamily } = context;

  return {
    familyMembers,
    switchProfile,
    linkFamily
  };
}
