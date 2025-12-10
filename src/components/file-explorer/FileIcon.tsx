import React from 'react';
import {
  Archive,
  Code,
  Database,
  File,
  FileAudio,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Settings,
} from 'lucide-react';


export interface FileIconProps {
  filename: string;
  isFolder?: boolean;
  size?: number;
  className?: string;
  style?: React.CSSProperties;
}


const getFileIcon = (filename: string, isFolder: boolean = false) => {
  if (isFolder) {
    return Folder;
  }

  const extension = filename.split('.').pop()?.toLowerCase() || '';


  if (['js', 'jsx', 'ts', 'tsx', 'vue', 'svelte'].includes(extension)) {
    return FileCode;
  }

  if (['html', 'css', 'scss', 'sass', 'less', 'styl'].includes(extension)) {
    return Code;
  }

  if (['json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf'].includes(extension)) {
    return Settings;
  }

  if (
    ['py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(extension)
  ) {
    return Code;
  }


  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(extension)) {
    return FileImage;
  }


  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(extension)) {
    return FileVideo;
  }


  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension)) {
    return FileAudio;
  }


  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return Archive;
  }


  if (['db', 'sqlite', 'sql', 'mdb'].includes(extension)) {
    return Database;
  }


  if (['txt', 'md', 'rst', 'log', 'readme'].includes(extension)) {
    return FileText;
  }


  return File;
};


const getFileIconColor = (filename: string, isFolder: boolean = false) => {
  if (isFolder) {
  return '#00A6D7';
  }

  const extension = filename.split('.').pop()?.toLowerCase() || '';


  if (['js', 'jsx', 'ts', 'tsx'].includes(extension)) {
  return '#5FD6F5';
  }


  if (['vue', 'svelte'].includes(extension)) {
  return '#00A6D7';
  }


  if (['css', 'scss', 'sass', 'less', 'styl'].includes(extension)) {
    return '#9CA3AF';
  }


  if (extension === 'html') {
    return '#E6D3A3';
  }


  if (['json', 'xml', 'yaml', 'yml', 'toml', 'ini', 'conf'].includes(extension)) {
    return '#6B7280';
  }


  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico', 'tiff'].includes(extension)) {
    return '#E6D3A3';
  }


  if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', '3gp'].includes(extension)) {
    return '#4B5563';
  }


  if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(extension)) {
  return '#5FD6F5';
  }


  if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(extension)) {
    return '#4B5563';
  }


  if (
    ['py', 'java', 'cpp', 'c', 'cs', 'php', 'rb', 'go', 'rs', 'swift', 'kt'].includes(extension)
  ) {
    return '#9CA3AF';
  }


  return '#9CA3AF';
};

export const FileIcon: React.FC<FileIconProps> = ({
  filename,
  isFolder = false,
  size = 16,
  className = '',
  style = {},
}) => {
  const IconComponent = getFileIcon(filename, isFolder);
  const iconColor = getFileIconColor(filename, isFolder);

  return (
    <IconComponent
      size={size}
      strokeWidth={1.5}
      className={className}
      style={{
        color: iconColor,
        flexShrink: 0,
        opacity: 0.85,
        transition: 'all 0.2s ease-in-out',
        ...style,
      }}
    />
  );
};

export default FileIcon;
