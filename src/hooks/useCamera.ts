/**
 * Hook para acceder a la cámara del dispositivo via MediaDevices API.
 *
 * Gestiona el ciclo de vida del stream de video:
 * - Solicita permiso al usuario
 * - Proporciona ref del elemento <video>
 * - Expone función para capturar un frame como File
 * - Limpia el stream al desmontar el componente
 */
import { useState, useRef, useCallback, useEffect } from 'react';

interface UseCameraReturn {
  /** Ref para conectar al elemento <video> del DOM */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Si el stream de cámara está activo */
  isActive: boolean;
  /** Si está procesando el permiso/inicio */
  isLoading: boolean;
  /** Error si la cámara no está disponible o el usuario la denegó */
  error: string | null;
  /** Inicia el stream de cámara */
  startCamera: () => Promise<void>;
  /** Detiene el stream y libera el hardware */
  stopCamera: () => void;
  /** Captura el frame actual del video como File (JPEG) */
  captureFrame: () => File | null;
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Inicia el stream de video desde la cámara trasera (o frontal como fallback) */
  const startCamera = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Tu navegador no soporta acceso a la cámara.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Preferir cámara trasera en móvil, cualquiera en desktop
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsActive(true);
    } catch (err) {
      const e = err as Error;
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') {
        setError('Acceso a la cámara denegado. Habilita el permiso en tu navegador.');
      } else if (e.name === 'NotFoundError') {
        setError('No se encontró ninguna cámara disponible.');
      } else {
        setError(`Error al iniciar la cámara: ${e.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /** Detiene todos los tracks y libera el hardware de la cámara */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setError(null);
  }, []);

  /**
   * Captura el frame actual del elemento <video> como File JPEG.
   *
   * @returns File con la imagen capturada, o null si la cámara no está activa.
   */
  const captureFrame = useCallback((): File | null => {
    if (!videoRef.current || !isActive) return null;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convertir canvas a Blob y luego a File
    return new Promise<File | null>((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          const file = new File([blob], `capture_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          });
          resolve(file);
        },
        'image/jpeg',
        0.92, // Calidad 92% — balance entre tamaño y calidad
      );
    }) as unknown as File | null;
  }, [isActive]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return {
    videoRef,
    isActive,
    isLoading,
    error,
    startCamera,
    stopCamera,
    captureFrame,
  };
}
