import { useState, useRef } from 'react';
import { useScanStore } from '../../store/scan.store';
import { UploadCloud, Image as ImageIcon, X, FileImage } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ImageUploader() {
  const { currentFile, previewUrl, setFileList, isScanning } = useScanStore();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isScanning) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setFileList(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileList(e.target.files[0]);
    }
  };

  /* ── Preview State ─────────────────────────────────────────── */
  if (currentFile && previewUrl) {
    return (
      <div className="w-full relative rounded-2xl overflow-hidden border border-border group">
        {/* Image */}
        <img
          src={previewUrl}
          alt="Preview"
          className={`w-full h-72 object-cover transition-all duration-500 ${
            isScanning ? 'opacity-40 scale-105 blur-[2px]' : ''
          }`}
        />

        {/* Scanning overlay */}
        {isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/60 backdrop-blur-sm">
            {/* Scan line */}
            <div className="absolute inset-x-0 scan-line" />

            {/* Spinner */}
            <div className="relative mb-4">
              <div className="w-14 h-14 rounded-full border-2 border-primary/20" />
              <div className="absolute inset-0 w-14 h-14 rounded-full border-2 border-transparent border-t-primary animate-spin" />
              <div className="absolute inset-[5px] w-[calc(100%-10px)] h-[calc(100%-10px)] rounded-full border-2 border-transparent border-t-primary/40 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
            </div>

            <p className="font-semibold text-foreground text-sm tracking-wide">
              Generando Grafo IA
            </p>
            <p className="text-muted-foreground text-xs mt-1">LangGraph pipeline activo...</p>
          </div>
        )}

        {/* File info + Change button */}
        {!isScanning && (
          <>
            {/* Gradient overlay bottom */}
            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-background/80 to-transparent" />

            {/* File name */}
            <div className="absolute bottom-3 left-4 flex items-center gap-2">
              <FileImage size={14} className="text-primary" />
              <span className="text-xs font-medium text-foreground/80 truncate max-w-[200px]">
                {currentFile.name}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(currentFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>

            {/* Change button */}
            <button
              onClick={() => setFileList(null)}
              className="absolute top-3 right-3 bg-background/70 backdrop-blur-md text-foreground border border-border rounded-lg px-3 py-1.5 text-xs font-medium flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-background/90"
            >
              <X size={13} />
              Cambiar
            </button>
          </>
        )}
      </div>
    );
  }

  /* ── Drop Zone ──────────────────────────────────────────────── */
  return (
    <div
      className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer w-full h-72 relative overflow-hidden
        ${
          isDragging
            ? 'border-primary bg-primary/5 animate-pulse-glow'
            : 'border-border hover:border-primary/50 hover:bg-card/60 bg-card/30'
        }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />

      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-4 left-4 w-8 h-8 border border-primary/30 rounded-lg" />
        <div className="absolute top-4 right-4 w-4 h-4 border border-primary/20 rounded" />
        <div className="absolute bottom-4 left-8 w-3 h-3 bg-primary/20 rounded-full" />
        <div className="absolute bottom-6 right-6 w-6 h-6 border border-primary/25 rounded-full" />
      </div>

      {/* Icon */}
      <div
        className={`p-4 rounded-2xl mb-4 transition-all duration-300 ${
          isDragging
            ? 'bg-primary/20 text-primary scale-110'
            : 'bg-muted/50 text-muted-foreground'
        }`}
      >
        <UploadCloud size={30} />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1.5">
        {isDragging ? 'Suelta la imagen aquí' : 'Sube o arrastra una imagen'}
      </h3>
      <p className="text-muted-foreground text-xs max-w-xs mb-5 leading-relaxed">
        JPEG, PNG, WEBP · Máx. 10 MB · Compatible con LLaVa y GPT-4o Vision
      </p>

      <Button
        variant="outline"
        size="sm"
        className="gap-2 text-xs border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        <ImageIcon size={14} />
        Seleccionar de Galería
      </Button>
    </div>
  );
}
