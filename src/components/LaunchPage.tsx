import { useState, useRef } from 'react';

interface LaunchPageProps {
  onProceed: () => void;
}

export function LaunchPage({ onProceed }: LaunchPageProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('video/')) {
      setFileName(file.name);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">
        {/* Logo and Title */}
        <div className="mb-12">
          <h1 className="text-5xl lg:text-6xl font-bold text-white flex items-center justify-center gap-4 mb-4">
            <span className="text-6xl">🛒</span>
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
              Flowlytics
            </span>
          </h1>
          <p className="text-xl text-gray-400">
            AI-powered retail traffic analysis and layout optimization
          </p>
        </div>

        {/* Upload Dropbox */}
        <div
          onClick={handleClick}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`glass-card p-12 mb-8 cursor-pointer transition-all duration-300 ${
            isDragging
              ? 'border-accent-purple border-2 bg-accent-purple/10'
              : 'border-dark-border border-2 border-dashed hover:border-accent-cyan hover:bg-white/5'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-4">
            <div className={`p-4 rounded-full ${fileName ? 'bg-emerald-600/20' : 'bg-accent-purple/20'}`}>
              {fileName ? (
                <svg className="h-12 w-12 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-12 w-12 text-accent-purple" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              )}
            </div>

            {fileName ? (
              <>
                <p className="text-lg text-emerald-400 font-medium">{fileName}</p>
                <p className="text-sm text-gray-500">Click or drag to replace</p>
              </>
            ) : (
              <>
                <p className="text-lg text-white font-medium">
                  Drop your store footage here
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse • MP4, MOV, AVI supported
                </p>
              </>
            )}
          </div>
        </div>

        {/* Proceed Button */}
        <button
          onClick={onProceed}
          className="btn-primary text-lg px-8 py-4 flex items-center justify-center gap-3 mx-auto"
        >
          <span>Proceed to Dashboard</span>
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Footer hint */}
        <p className="mt-8 text-sm text-gray-600">
          Upload footage to analyze customer traffic patterns
        </p>
      </div>
    </div>
  );
}
