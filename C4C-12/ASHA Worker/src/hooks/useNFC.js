/**
 * GraamSehat ASHA Worker App - Web NFC Hook
 * Path: /src/hooks/useNFC.js
 * Exposes Web NFC API interaction (NDEFReader), tracking browser support,
 * scanning status, error logging, and providing a simulator fallback for development.
 */

import { useState, useEffect } from "react";

export function useNFC() {
  const [isSupported, setIsSupported] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [nfcError, setNfcError] = useState(null);
  const [ndefReader, setNdefReader] = useState(null);

  // Check support on mount
  useEffect(() => {
    if ("NDEFReader" in window) {
      setIsSupported(true);
      setNdefReader(new window.NDEFReader());
    } else {
      setIsSupported(false);
    }
  }, []);

  /**
   * Starts NFC scanning.
   * @param {function} onUidRead - Callback when UID is scanned successfully
   */
  const startNFCScan = async (onUidRead) => {
    setNfcError(null);
    
    if (!isSupported || !ndefReader) {
      setNfcError("NFC not available on this device, use QR instead");
      return;
    }

    setIsScanning(true);
    try {
      await ndefReader.scan();
      console.log("NFC scanning started successfully.");
      
      ndefReader.onreadingerror = () => {
        setNfcError("Could not read NFC tag. Make sure the card is held close.");
      };

      ndefReader.onreading = ({ message }) => {
        console.log("NDEF message read.");
        for (const record of message.records) {
          if (record.recordType === "text") {
            const textDecoder = new TextDecoder(record.encoding || "utf-8");
            const decoded = textDecoder.decode(record.data);
            console.log(`NFC text record: ${decoded}`);
            
            // Clean UID and trigger success
            onUidRead(decoded.trim());
            stopNFCScan();
            break;
          }
        }
      };
    } catch (error) {
      console.error("NFC reading failed", error);
      setNfcError(error.message || "Failed to initialize NFC reader.");
      setIsScanning(false);
    }
  };

  /**
   * Stop listening to NFC tags.
   */
  const stopNFCScan = () => {
    setIsScanning(false);
    // Web NFC stops reading automatically when tab loses focus or when reader is dereferenced.
    // In current spec, we can just clear our local status.
  };

  /**
   * Simulates a mock NFC card scan (essential for desktop/testing).
   * @param {string} mockUid - Mock UID string
   * @param {function} callback - OnSuccess callback
   */
  const triggerMockScan = (mockUid, callback) => {
    console.log(`Mocking NFC tap: ${mockUid}`);
    setIsScanning(true);
    setTimeout(() => {
      callback(mockUid);
      setIsScanning(false);
    }, 800);
  };

  return {
    isSupported,
    isScanning,
    nfcError,
    startNFCScan,
    stopNFCScan,
    triggerMockScan
  };
}

export default useNFC;
