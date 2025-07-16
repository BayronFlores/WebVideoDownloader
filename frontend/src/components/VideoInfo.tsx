import React from 'react';

type VideoInfo = {
  title: string;
  thumbnail: string;
};

interface VideoInfoProps {
  info: VideoInfo;
  onDownload: () => void;
  isDownloading: boolean;
}

export const VideoInfo: React.FC<VideoInfoProps> = ({
  info,
  onDownload,
  isDownloading,
}) => (
  <section className="border-t pt-6 mt-4">
    <div className="flex flex-col md:flex-row gap-6 items-center">
      {info.thumbnail && (
        <div className="flex-shrink-0 w-full md:w-64">
          <img
            src={info.thumbnail}
            alt="Miniatura del video"
            className="w-full h-auto rounded-lg shadow-md object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="flex-1 w-full">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4 leading-tight break-words">
          {info.title}
        </h2>
        <button
          onClick={onDownload}
          disabled={isDownloading}
          className="w-full sm:w-auto px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center"
        >
          {isDownloading ? (
            <span className="flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Descargando...
            </span>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
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
              Descargar MP3
            </>
          )}
        </button>
      </div>
    </div>
  </section>
);
