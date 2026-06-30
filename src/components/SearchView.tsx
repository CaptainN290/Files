import React, { useRef, useEffect } from 'react';
import type { ArchiveFile } from '../types';

interface Props {
  query: string;
  setQuery: (q: string) => void;
  results: ArchiveFile[];
  onSelect: (file: ArchiveFile) => void;
  onBack: () => void;
}

const SearchView: React.FC<Props> = ({ query, setQuery, results, onSelect, onBack }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="search-view">
      <div className="meta-label" style={{ marginBottom: '0.5rem' }}>QUERY:</div>
      <input
        ref={inputRef}
        className="search-input"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            e.preventDefault();
            onBack();
          } else if (e.key === 'Enter' && results.length > 0) {
            onSelect(results[0]);
          }
        }}
      />
      <div className="list-view">
        {results.length === 0 && query !== '' && (
          <div className="list-item"><span className="cursor">&gt;</span>NO RESULTS FOUND</div>
        )}
        {results.map((file, index) => (
          <div 
            key={index} 
            className="list-item" 
            onClick={() => onSelect(file)}
          >
            <span className="cursor">&gt;</span>{file.id} - {file.title} [{file.category}]
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchView;
