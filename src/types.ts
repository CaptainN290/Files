export interface ArchiveFile {
  id: string;
  title: string;
  category: string;
  clearance: number;
  author: string;
  date: string;
  tags: string[];
  summary: string;
  body: string;
  
  // Future Expansion Hooks
  hidden?: boolean;
  locked?: boolean;
  related?: string[];
  metadata?: Record<string, string>;
}

export interface FileSystemTree {
  [folder: string]: ArchiveFile[];
}
