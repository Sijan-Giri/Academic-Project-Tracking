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
          'cursor-pointer rounded-xl border-2 border-dashed border-white/20 bg-white/5 p-8 text-center transition-colors hover:bg-white/10',
          isDragActive && 'border-indigo-500 bg-indigo-500/10'
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto mb-4 h-10 w-10 text-gray-400" />
        <p className="mb-2 text-sm font-medium text-white">
          {isDragActive ? 'Drop the files here...' : 'Drag & drop files here, or click to select files'}
        </p>
        <p className="text-xs text-gray-500">
          Max file size: {(maxSize / 1024 / 1024).toFixed(2)} MB
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center space-x-3 overflow-hidden">
                <FileIcon className="h-5 w-5 shrink-0 text-indigo-400" />
                <div className="truncate">
                  <p className="truncate text-sm font-medium text-white">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => removeFile(idx)} className="h-8 w-8 shrink-0 text-gray-400 hover:text-red-400">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
