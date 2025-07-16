// hooks/useDownloader.ts
import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

type VideoInfo = {
  title: string;
  thumbnail: string;
};

export const useDownloader = () => {
  const [url, setUrl] = useState('');
  const [estado, setEstado] = useState('');
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('audio.mp3');

  const buscar = async () => {
    setEstado('');
    setInfo(null);
    setDownloadUrl(null);
    if (!url) return;

    setIsSearching(true);
    setEstado('🔎 Buscando información...');
    try {
      const response = await axios.post<VideoInfo>(`${API_BASE_URL}/api/info`, {
        url,
      });
      setInfo(response.data);
      setEstado('');
    } catch (error) {
      setEstado('❌ No se pudo obtener la información');
      setInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  const descargar = async (isMobile: boolean, isIOS: boolean) => {
    setIsDownloading(true);
    setEstado('⏳ Descargando...');
    setDownloadUrl(null);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/descargar`,
        { url },
        { responseType: 'blob' },
      );

      const headers = response.headers;
      let disposition =
        headers['content-disposition'] || headers['Content-Disposition'];
      let nombreArchivo = 'audio.mp3';

      if (disposition) {
        let match = disposition.match(/filename\*=UTF-8''(.+)/);
        if (match && match[1]) {
          nombreArchivo = decodeURIComponent(match[1]);
        } else {
          match = disposition.match(/filename="?([^\";]+)"?/);
          if (match && match[1]) {
            nombreArchivo = match[1];
          }
        }
      }

      setDownloadFileName(nombreArchivo);

      const blob = new Blob([response.data], { type: 'audio/mp3' });
      const blobUrl = URL.createObjectURL(blob);

      const enlace = document.createElement('a');
      enlace.href = blobUrl;
      enlace.download = nombreArchivo;
      enlace.style.display = 'none';

      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);

      setTimeout(() => {
        if (isMobile) {
          setDownloadUrl(blobUrl);
          if (isIOS) {
            setEstado(
              '📱 En iPhone/iPad: Si no se descargó automáticamente, usa el enlace de abajo. Si se abre un reproductor, mantén pulsado y selecciona "Compartir" → "Guardar en Archivos".',
            );
          } else {
            setEstado(
              '📱 Si la descarga no comenzó automáticamente, usa el enlace de abajo.',
            );
          }
        } else {
          setEstado('✅ ¡Descarga completada!');
          setTimeout(() => {
            URL.revokeObjectURL(blobUrl);
          }, 5000);
        }
      }, 1500);
    } catch (error) {
      setEstado('❌ Error al descargar');
      setDownloadUrl(null);
    } finally {
      setIsDownloading(false);
    }
  };

  const limpiarDownloadUrl = () => {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      setDownloadUrl(null);
    }
  };

  return {
    url,
    setUrl,
    estado,
    info,
    isSearching,
    isDownloading,
    downloadUrl,
    downloadFileName,
    buscar,
    descargar,
    limpiarDownloadUrl,
  };
};
