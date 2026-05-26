/**
 * GraamSehat ASHA Worker App - QR Code Hook
 * Path: /src/hooks/useQR.js
 * Interfaces with the html5-qrcode camera capture library. Manages initialization
 * and teardown of camera streams.
 */

import { useState, useEffect } from "react";
import { Html5Qrcode } from "html5-qrcode";

export function useQR() {
  const [isScanning, setIsScanning] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [scannerInstance, setScannerInstance] = useState(null);

  /**
   * Initializes and starts camera QR scanning in a given element.
   * @param {string} elementId - Target DOM div ID to render the camera preview
   * @param {function} onScanSuccess - Triggered on QR decode: (decodedText) => {}
   */
  const startQRScan = async (elementId, onScanSuccess) => {
    setQrError(null);
    setIsScanning(true);

    try {
      const qrcode = new Html5Qrcode(elementId);
      setScannerInstance(qrcode);

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 }
      };

      await qrcode.start(
        { facingMode: "environment" }, // Rear camera
        config,
        (decodedText) => {
          console.log(`QR Decoded: ${decodedText}`);
          onScanSuccess(decodedText);
          // Auto-stop scanner after success
          qrcode.stop().then(() => {
            setIsScanning(false);
          }).catch(err => {
            console.error("Failed to stop QR scanner", err);
            setIsScanning(false);
          });
        },
        (errorMessage) => {
          // Silent scan frame errors as they happen frequently before a code is found
          // Only log major camera errors
        }
      );
    } catch (error) {
      console.error("QR scanner start failed", error);
      setQrError("Camera access denied or device does not have a camera.");
      setIsScanning(false);
    }
  };

  /**
   * Stops active camera stream and frees resources.
   */
  const stopQRScan = async () => {
    if (scannerInstance && scannerInstance.isScanning) {
      try {
        await scannerInstance.stop();
      } catch (error) {
        console.error("Error stopping scanner stream", error);
      } finally {
        setIsScanning(false);
        setScannerInstance(null);
      }
    } else {
      setIsScanning(false);
    }
  };

  // Auto clean-up camera on unmount
  useEffect(() => {
    return () => {
      if (scannerInstance && scannerInstance.isScanning) {
        scannerInstance.stop().catch(err => console.error("Unmount cleanup failed", err));
      }
    };
  }, [scannerInstance]);

  return {
    isScanning,
    qrError,
    startQRScan,
    stopQRScan
  };
}

export default useQR;
