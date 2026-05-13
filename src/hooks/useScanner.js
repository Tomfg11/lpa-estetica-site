import { useState, useEffect, useRef, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

/**
 * useScanner — Hook para gerenciar o leitor de QR Code via câmera.
 * Encapsula toda a lógica do html5-qrcode.
 * Mobile-first: usa câmera traseira por padrão.
 *
 * @param {function} onScanSuccess - Callback quando um QR é lido com sucesso
 * @returns {{ startScanning, stopScanning, isScanning, error }}
 */
const useScanner = (onScanSuccess) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState(null);
  const scannerRef = useRef(null);
  const scannerContainerId = 'qr-scanner-container';

  /**
   * Inicia a leitura da câmera.
   */
  const startScanning = useCallback(async () => {
    setError(null);

    try {
      // Cria nova instância se não existir
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(scannerContainerId);
      }

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Câmera traseira (mobile-first)
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        (decodedText) => {
          // Sucesso! Para o scanner e retorna o valor
          onScanSuccess(decodedText);
          stopScanning();
        },
        () => {
          // Scan em andamento — nenhuma ação necessária
        }
      );

      setIsScanning(true);
    } catch (err) {
      console.error('Erro ao iniciar scanner:', err);

      if (err.toString().includes('NotAllowedError')) {
        setError('Permissão de câmera negada. Habilite nas configurações do navegador.');
      } else if (err.toString().includes('NotFoundError')) {
        setError('Nenhuma câmera encontrada no dispositivo.');
      } else {
        setError('Erro ao acessar a câmera. Tente novamente.');
      }
      setIsScanning(false);
    }
  }, [onScanSuccess]);

  /**
   * Para a leitura da câmera.
   */
  const stopScanning = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        // Estado 2 = SCANNING
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch (err) {
        // Ignora erro ao parar (pode já estar parado)
        console.warn('Aviso ao parar scanner:', err);
      }
    }
    setIsScanning(false);
  }, []);

  // Cleanup ao desmontar o componente
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        try {
          const state = scannerRef.current.getState();
          if (state === 2) {
            scannerRef.current.stop();
          }
        } catch (err) {
          // Ignora erros no cleanup
        }
        scannerRef.current = null;
      }
    };
  }, []);

  return {
    startScanning,
    stopScanning,
    isScanning,
    error,
    scannerContainerId,
  };
};

export default useScanner;
