
import React, { useState } from 'react';
import { FileUp } from 'lucide-react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      className={`relative group h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer
        ${isDragging 
          ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' 
          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300'}`}
    >
      <input
        type="file"
        accept="application/pdf"
        onChange={handleInput}
        className="absolute inset-0 opacity-0 cursor-pointer"
      />
      <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
        <FileUp className={`w-10 h-10 ${isDragging ? 'text-indigo-600' : 'text-slate-400'}`} />
      </div>
      <p className="text-slate-700 font-medium text-lg">拖拽 PDF 文件到此处</p>
      <p className="text-slate-400 text-sm mt-1">或者 点击此处浏览文件</p>
      <div className="mt-4 flex gap-2">
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500">仅限 PDF</span>
        <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs text-slate-500">最大 100MB</span>
      </div>
    </div>
  );
};
