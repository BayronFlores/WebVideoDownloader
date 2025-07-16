import React from 'react';

interface DownloadLinkProps {
  downloadUrl: string;
  downloadFileName: string;
  isIOS: boolean;
}

export const DownloadLink: React.FC<DownloadLinkProps> = ({
  downloadUrl,
  downloadFileName,
  isIOS,
}) => (
  <div className="mb-6 text-center bg-blue-50 border border-blue-200 rounded-lg p-4">
    <p className="text-sm text-blue-700 mb-3">
      {isIOS ? '📱 Descarga manual para iOS:' : '📱 Descarga manual:'}
    </p>
    <a
      href={downloadUrl}
      download={downloadFileName}
      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200"
    >
      <svg
        className="w-4 h-4 mr-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      Tocar para descargar: {downloadFileName}
    </a>
    {isIOS && (
      <div className="text-xs text-blue-600 mt-2">
        💡 Si se abre un reproductor, mantén pulsado el archivo y selecciona
        "Compartir" → "Guardar en Archivos"
      </div>
    )}
  </div>
);
