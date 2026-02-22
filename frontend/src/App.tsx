import { useState } from 'react';
import { useDeviceDetection } from './hooks/useDeviceDetection';
import { useDownloader } from './hooks/useDownloader';
import { Header } from './components/Header';
import { SearchInput } from './components/SearchInput';
import { StatusMessage } from './components/StatusMessage';
import { DownloadLink } from './components/DownloadLink';
import { VideoInfo } from './components/VideoInfo';
import { Footer } from './components/Footer';

function App() {
  const { isMobile, isIOS } = useDeviceDetection();
  const {
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
  } = useDownloader();

  const handleDownload = () => descargar(isMobile(), isIOS());

  const [userInput, setUserInput] = useState('');
  const [passInput, setPassInput] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const handleLogin = async () => {
    setLoginLoading(true);
    await login(userInput, passInput);
    setLoginLoading(false);
  };

  const handleLoginKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  // Mientras se verifica la sesión, mostrar un loader
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex items-center justify-center">
        <div className="text-blue-700 text-lg animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex items-center justify-center px-4">
        <div className="bg-white/90 rounded-2xl shadow-2xl p-8 w-full max-w-sm">
          <h2 className="text-2xl font-extrabold text-gray-800 mb-6 text-center">
            🔐 Acceso
          </h2>
          <div className="flex flex-col gap-4">
            <input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleLoginKeyDown}
              placeholder="Usuario"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
              autoFocus
              autoComplete="username"
            />
            <input
              type="password"
              value={passInput}
              onChange={(e) => setPassInput(e.target.value)}
              onKeyDown={handleLoginKeyDown}
              placeholder="Contraseña"
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-base"
              autoComplete="current-password"
            />
            <button
              onClick={handleLogin}
              disabled={loginLoading || !userInput || !passInput}
              className="py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {loginLoading ? 'Entrando...' : 'Entrar'}
            </button>
            {estado && (
              <p className="text-center text-red-600 text-sm font-medium">
                {estado}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex items-center justify-center px-2">
      <div className="w-full max-w-2xl mx-auto">
        <Header isMobile={isMobile()} />

        <main className="bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 transition-all">
          <div className="flex justify-end mb-4">
            <button
              onClick={logout}
              className="text-xs text-gray-400 hover:text-gray-600 underline transition-colors"
            >
              Cerrar sesión
            </button>
          </div>

          <SearchInput
            url={url}
            setUrl={setUrl}
            onSearch={buscar}
            onUrlChange={limpiarDownloadUrl}
            isSearching={isSearching}
            isDownloading={isDownloading}
          />

          <StatusMessage estado={estado} />

          {downloadUrl && (
            <DownloadLink
              downloadUrl={downloadUrl}
              downloadFileName={downloadFileName}
              isIOS={isIOS()}
            />
          )}

          {info && (
            <VideoInfo
              info={info}
              onDownload={handleDownload}
              isDownloading={isDownloading}
            />
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
}

export default App;
