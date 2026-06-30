import React from 'react';

interface Props {
  items: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
}

const FolderView: React.FC<Props> = ({ items, selectedIndex, onSelect }) => {
  return (
    <div className="folder-view">
      {items.map((item, index) => (
        <div 
          key={index} 
          className={`list-item ${index === selectedIndex ? 'selected' : ''}`}
          onClick={() => onSelect(index)}
        >
          <span className="cursor">&gt;</span>{item}
        </div>
      ))}
    </div>
  );
};

export default FolderView;
