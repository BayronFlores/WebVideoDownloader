import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios global: siempre envía cookies
axios.defaults.withCredentials = true;

type VideoInfo = {
  title: string;
  thumbnail: string;
  duration?: number;
};

const limpiarUrlYoutube = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (
      urlObj.hostname.includes('youtube.com') &&
      urlObj.pathname === '/watch' &&
      urlObj.searchParams.has('v')
    ) {
      const videoId = urlObj.searchParams.get('v');
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    // Soportar también youtu.be
    if (urlObj.hostname === 'youtu.be') {
      const videoId = urlObj.pathname.slice(1);
      return `https://www.youtube.com/watch?v=${videoId}`;
    }
    return url; // No se altera si no cumple condiciones
  } catch {
    return url; // Si es inválida, se retorna igual
  }
};

export const useDownloader = () => {
  const [url, setUrl] = useState('');
  const [estado, setEstado] = useState('');
  const [info, setInfo] = useState<VideoInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFileName, setDownloadFileName] = useState<string>('audio.mp3');
  const [loggedIn, setLoggedIn] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Al montar, verificar si ya hay una sesión activa (ej: al recargar la página)
  useEffect(() => {
    axios
      .get(`${API_BASE_URL}/api/me`)
      .then((res) => {
        if (res.data.loggedIn) setLoggedIn(true);
      })
      .catch(() => {
        /* sin sesión */
      })
      .finally(() => setCheckingSession(false));
  }, []);

  // Interceptor: si cualquier petición retorna 401, forzar logout del frontend
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (res) => res,
      (error) => {
        if (error.response?.status === 401 && loggedIn) {
          setLoggedIn(false);
          setEstado('❌ Sesión expirada. Inicia sesión de nuevo.');
          setInfo(null);
        }
        return Promise.reject(error);
      },
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, [loggedIn]);

  const login = async (username: string, password: string) => {
    try {
      await axios.post(`${API_BASE_URL}/api/login`, { username, password });
      setLoggedIn(true);
      setEstado('');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Error de conexión';
      setEstado(`❌ ${msg}`);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/logout`, {});
    } catch {
      /* ignorar */
    }
    setLoggedIn(false);
    setInfo(null);
    setDownloadUrl(null);
    setEstado('');
  };

  const buscar = async () => {
    setEstado('');
    setInfo(null);
    setDownloadUrl(null);
    if (!url) return;

    const urlLimpia = limpiarUrlYoutube(url);

    setIsSearching(true);
    setEstado('🔎 Buscando información...');
    try {
      const response = await axios.post<VideoInfo>(`${API_BASE_URL}/api/info`, {
        url: urlLimpia,
      });
      setInfo(response.data);
      setEstado('');
    } catch (error: any) {
      if (error.response?.status === 401) return; // manejado por el interceptor
      const backendMsg = error.response?.data?.error || '';
      let mensaje = '❌ No se pudo obtener la información del video';

      if (backendMsg.includes('verificación') || backendMsg.includes('bot')) {
        mensaje =
          '❌ YouTube bloqueó la consulta. Intenta con otro video o más tarde.';
      } else if (
        backendMsg.includes('disponible') ||
        backendMsg.includes('privado')
      ) {
        mensaje = '❌ El video no está disponible o es privado.';
      } else if (backendMsg) {
        mensaje = `❌ ${backendMsg}`;
      }

      setEstado(mensaje);
      setInfo(null);
    } finally {
      setIsSearching(false);
    }
  };

  const descargar = async (isMobile: boolean, isIOS: boolean) => {
    setIsDownloading(true);
    setEstado('⏳ Procesando descarga, esto puede tardar unos segundos...');
    setDownloadUrl(null);

    const urlLimpia = limpiarUrlYoutube(url);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/descargar`,
        { url: urlLimpia },
        { responseType: 'blob' },
      );

      const headers = response.headers;
      const disposition =
        headers['content-disposition'] || headers['Content-Disposition'] || '';

      let nombreArchivo = 'audio.mp3';
      const matchUtf8 = disposition.match(/filename\*=UTF-8''(.+)/i);
      if (matchUtf8?.[1]) {
        nombreArchivo = decodeURIComponent(matchUtf8[1]);
      } else {
        const matchPlain = disposition.match(/filename="?([^";]+)"?/i);
        if (matchPlain?.[1]) nombreArchivo = matchPlain[1].trim();
      }

      setDownloadFileName(nombreArchivo);

      const blob = new Blob([response.data], { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(blob);

      // Intentar descarga automática
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
              '📱 En iPhone/iPad: Si no se descargó automáticamente, usa el enlace de abajo. ' +
                'Si se abre un reproductor, mantén pulsado y selecciona "Compartir" → "Guardar en Archivos".',
            );
          } else {
            setEstado(
              '📱 Si la descarga no comenzó automáticamente, usa el enlace de abajo.',
            );
          }
        } else {
          setEstado('✅ ¡Descarga completada!');
          setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
        }
      }, 1500);
    } catch (error: any) {
      if (error.response?.status === 401) return;
      const msg = error.response?.data?.error;
      setEstado(
        msg
          ? `❌ ${msg}`
          : '❌ Error al descargar. Intenta de nuevo en unos momentos.',
      );
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
    loggedIn,
    checkingSession,
    login,
    logout,
    buscar,
    descargar,
    limpiarDownloadUrl,
  };
};
