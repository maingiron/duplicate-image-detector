
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function truncateFilename(filename: string, maxLength: number = 20): string {
  if (filename.length <= maxLength) return filename;
  
  const extension = filename.split('.').pop() || '';
  const name = filename.substring(0, filename.length - extension.length - 1);
  
  if (name.length <= maxLength - 3 - extension.length) {
    return filename;
  }
  
  return `${name.substring(0, maxLength - 3 - extension.length)}...${extension ? `.${extension}` : ''}`;
}
