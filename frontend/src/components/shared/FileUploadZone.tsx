import { useCallback, useState } from 'react';
import { useDropzone, Accept } from 'react-dropzone';
import { UploadCloud, X, File as FileIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface FileUploadZoneProps {
  accept?: Accept;
  maxSize?: number;
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  className?: string;
}

export default function FileUploadZone({ accept, maxSize = 5242880, onFilesSelected, multiple = false, className }: FileUploadZoneProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prev) => {
      const newFiles = multiple ? [...prev, ...acceptedFiles] : acceptedFiles;
      onFilesSelected(newFiles);
      return newFiles;
    });
  }, [multiple, onFilesSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple,
  });

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      onFilesSelected(newFiles);
      return newFiles;
    });
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'cursor-pointer rounded-2xl border-2 border-dashed dark:border-white/20 dark:bg-white/5 border-slate-300 bg-slate-50/80 p-8 text-center transition-all duration-200 hover:border-brand-strong hover:bg-brand-subtle dark:hover:bg-white/10 shadow-xs',
          isDragActive && 'border-brand-strong bg-brand-subtle'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-3 h-10 w-10 text-brand" />
        <p className="mb-1 text-sm font-bold text-foreground">
          {isDragActive ? 'Drop files here to attach...' : 'Drag & drop deliverables here, or click to browse'}
        </p>
        <p className="text-xs text-neutral-sm font-medium">
          Supported file types (PDF, ZIP, DOCX) up to {(maxSize / 1024 / 1024).toFixed(0)} MB
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-xl border dark:border-white/10 border-slate-200/80 dark:bg-white/5 bg-slate-50 p-3 shadow-xs">
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileIcon className="h-5 w-5 shrink-0 text-brand" />
                <div className="truncate">
                  <p className="truncate text-sm font-bold text-foreground">{file.name}</p>
                  <p className="text-xs text-neutral-sm font-medium">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 shrink-0 text-neutral-sm hover:text-danger">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
