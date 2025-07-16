import React from 'react';

interface SearchInputProps {
  url: string;
  setUrl: (url: string) => void;
  onSearch: () => void;
  onUrlChange: () => void;
  isSearching: boolean;
  isDownloading: boolean;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  url,
  setUrl,
  onSearch,
  onUrlChange,
  isSearching,
  isDownloading,
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isSearching) {
      onSearch();
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        URL del video de YouTube
      </label>
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="https://www.youtube.com/watch?v=..."
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            onUrlChange();
          }}
          onKeyDown={handleKeyPress}
          disabled={isSearching || isDownloading}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-base"
          autoFocus
          aria-label="URL del video de YouTube"
        />
        <button
          onClick={onSearch}
          disabled={!url || isSearching || isDownloading}
          className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center min-w-[120px]"
        >
          {isSearching ? (
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
              Buscando...
            </span>
          ) : (
            'Buscar'
          )}
        </button>
      </div>
    </div>
  );
};
