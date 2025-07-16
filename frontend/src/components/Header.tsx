import React from 'react';

interface HeaderProps {
  isMobile: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isMobile }) => (
  <header className="text-center mb-8">
    <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2 mt-10 drop-shadow">
      🎵 Descargador MP3
    </h1>
    <p className="text-gray-600 text-base sm:text-lg">
      Convierte videos de YouTube a MP3 fácilmente
    </p>
    {isMobile && (
      <div className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
        📱 Dispositivo móvil detectado. La descarga puede requerir pasos
        adicionales según tu navegador.
      </div>
    )}
  </header>
);
