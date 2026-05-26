/**
 * src/hooks/usePatient.js
 * Custom hook to consume Patient Context.
 */

import { useContext } from 'react';
import { PatientContext } from '../context/PatientContext';

export default function usePatient() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatient must be used within a PatientProvider');
  }
  return context;
}
