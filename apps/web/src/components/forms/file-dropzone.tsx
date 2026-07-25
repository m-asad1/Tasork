'use client';

import { Button } from '@tasork/ui';
import { File as FileIcon, Upload, X } from 'lucide-react';
import * as React from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_FILES = 10;
const MAX_SIZE = 50 * 1024 * 1024; // 50MB per file — see docs/26_File_Management.md

export interface FileDropzoneProps {
  files: File[];
  onChange: (files: File[]) => void;
  error?: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({ files, onChange, error }: FileDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    maxFiles: MAX_FILES,
    maxSize: MAX_SIZE,
    onDrop: (accepted) => {
      onChange([...files, ...accepted].slice(0, MAX_FILES));
    },
  });

  function removeFile(index: number) {
    onChange(files.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <div
        {...getRootProps()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
          isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
        }`}
      >
        <input {...getInputProps()} />
        <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">Drag & drop files here, or click to browse</p>
        <p className="mt-1 text-xs text-muted-foreground">Up to {MAX_FILES} files, 50MB each</p>
      </div>

      {error && <p className="text-xs font-medium text-destructive">{error}</p>}

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, idx) => (
            <li key={`${file.name}-${idx}`} className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} aria-label={`Remove ${file.name}`}>
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
