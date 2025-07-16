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
    buscar,
    descargar,
    limpiarDownloadUrl,
  } = useDownloader();

  const handleDownload = () => descargar(isMobile(), isIOS());

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex items-center justify-center px-2">
      <div className="w-full max-w-2xl mx-auto">
        <Header isMobile={isMobile()} />

        <main className="bg-white/90 rounded-2xl shadow-2xl p-6 sm:p-8 mb-6 transition-all">
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
