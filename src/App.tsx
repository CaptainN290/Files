import React, { useState, useEffect, useCallback } from 'react';
import { loadFileSystem, getAllFiles } from './utils/loadFiles';
import type { FileSystemTree, ArchiveFile } from './types';
import { initAudio, sounds } from './utils/audio';
import FolderView from './components/FolderView';
import FileView from './components/FileView';
import SearchView from './components/SearchView';

const App: React.FC = () => {
  const [fileSystem, setFileSystem] = useState<FileSystemTree>({});
  const [allFiles, setAllFiles] = useState<ArchiveFile[]>([]);

  const [view, setView] = useState<'root' | 'folder' | 'file' | 'search'>('root');
  const [currentFolder, setCurrentFolder] = useState<string | null>(null);
  const [currentFile, setCurrentFile] = useState<ArchiveFile | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fs = loadFileSystem();
    setFileSystem(fs);
    setAllFiles(getAllFiles(fs));
  }, []);

  const folderNames = Object.keys(fileSystem);
  const rootItems = ['Search', ...folderNames];
  const currentFiles = currentFolder ? fileSystem[currentFolder] || [] : [];
  
  const getCurrentItems = () => {
    if (view === 'root') return rootItems;
    if (view === 'folder') return currentFiles.map(f => f.title);
    return [];
  };

  const currentItems = getCurrentItems();

  useEffect(() => {
    setSelectedIndex(0);
  }, [view, currentFolder]);

  const handleSelect = useCallback((idx: number) => {
    if (view === 'root') {
      if (idx === 0) {
        setView('search');
        setSearchQuery('');
        sounds.openFolder();
      } else {
        const folder = folderNames[idx - 1];
        if (folder) {
          setCurrentFolder(folder);
          setView('folder');
          sounds.openFolder();
        } else {
          sounds.error();
        }
      }
    } else if (view === 'folder') {
      const file = currentFiles[idx];
      if (file) {
        setCurrentFile(file);
        setView('file');
        sounds.openFile();
      } else {
        sounds.error();
      }
    }
  }, [view, folderNames, currentFiles]);

  const openFile = useCallback((file: ArchiveFile) => {
    setCurrentFile(file);
    setView('file');
    sounds.openFile();
  }, []);

  const handleBack = useCallback(() => {
    if (view === 'file') {
      setView('folder');
      sounds.back();
    } else if (view === 'folder' || view === 'search') {
      setView('root');
      setCurrentFolder(null);
      sounds.back();
    } else {
      sounds.error();
    }
  }, [view]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    initAudio();
    const key = e.key;

    if (view === 'search' && key !== 'Escape') return;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'Home', 'End', '/'].includes(key)) {
      e.preventDefault();
    }

    switch (key) {
      case 'ArrowUp':
        setSelectedIndex(prev => Math.max(0, prev - 1));
        sounds.move();
        break;
      case 'ArrowDown':
        setSelectedIndex(prev => Math.min(currentItems.length - 1, prev + 1));
        sounds.move();
        break;
      case 'Home':
        setSelectedIndex(0);
        sounds.move();
        break;
      case 'End':
        setSelectedIndex(currentItems.length - 1);
        sounds.move();
        break;
      case 'ArrowRight':
      case 'Enter':
        handleSelect(selectedIndex);
        break;
      case 'ArrowLeft':
      case 'Escape':
        handleBack();
        break;
      case '/':
        if (view !== 'search') {
          setView('search');
          setSearchQuery('');
          sounds.openFolder();
        }
        break;
    }
  }, [view, currentItems.length, selectedIndex, handleSelect, handleBack]);

  const searchResults = searchQuery 
    ? allFiles.filter(f => 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.summary.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderView = () => {
    if (view === 'file' && currentFile) {
      return <FileView file={currentFile} />;
    }
    if (view === 'search') {
      return (
        <SearchView 
          query={searchQuery}
          setQuery={setSearchQuery}
          results={searchResults}
          onSelect={openFile}
          onBack={handleBack}
        />
      );
    }
    return (
      <FolderView 
        items={currentItems} 
        selectedIndex={selectedIndex} 
        onSelect={(index) => {
          setSelectedIndex(index);
          handleSelect(index);
        }} 
      />
    );
  };

  return (
    <div className="app-container" tabIndex={0} onKeyDown={handleKeyDown}>
      <header 
        className="header" 
        style={{ cursor: view !== 'root' && view !== 'search' ? 'pointer' : 'default' }}
        onClick={() => view !== 'search' && handleBack()}
      >
        <div className="branding">
          <img src="/logo.PNG" alt="FaultFiles Logo" className="logo" />
          <div>
            <h1 className="title">FAULTFILES</h1>
            <div className="subtitle">CENTRAL INFORMATION SYSTEM // CLEARANCE: 1</div>
          </div>
        </div>
        {view !== 'root' && view !== 'search' && (
          <div className="back-hint">↑ BACK</div>
        )}
      </header>

      <main className="content">
        {renderView()}
      </main>

      <footer className="footer">
        <div>STATUS: CONNECTED | FILES: {allFiles.length}</div>
        <div className="footer-controls">
          {view === 'root' && <span className="mobile-only">TAP TO OPEN</span>}
          {view === 'root' && <span className="desktop-only">[↑↓] MOVE [→/ENTER] OPEN [/] SEARCH</span>}
          {view === 'folder' && <span className="mobile-only">TAP TO OPEN</span>}
          {view === 'folder' && <span className="desktop-only">[↑↓] MOVE [→/ENTER] OPEN [←/ESC] BACK</span>}
          {view === 'file' && <span className="mobile-only">TAP HEADER TO GO BACK</span>}
          {view === 'file' && <span className="desktop-only">[←/ESC] BACK</span>}
          {view === 'search' && <span className="mobile-only">TYPE TO SEARCH</span>}
          {view === 'search' && <span className="desktop-only">[TYPE] QUERY [ENTER] OPEN [ESC] BACK</span>}
        </div>
      </footer>
    </div>
  );
};

export default App;
