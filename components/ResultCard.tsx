
import React from 'react';
import { Download, Share2, CheckCircle2 } from 'lucide-react';
import { ProcessingResult } from '../types';

interface ResultCardProps {
  result: ProcessingResult;
  onReset: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, onReset }) => {
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-emerald-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-emerald-500 p-4 text-white flex items-center gap-2">
        <CheckCircle2 size={24} />
        <span className="font-bold">压缩成功！</span>
      </div>
      
      <div className="p-8">
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 mb-8">
          <div className="text-center">
            <p className="text-slate-400 text-sm mb-1">原始大小</p>
            <p className="text-2xl font-bold text-slate-800">{formatSize(result.originalSize)}</p>
          </div>
          <div className="hidden md:block w-px h-12 bg-slate-100"></div>
          <div className="text-center">
            <div className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm font-bold mb-2">
              节省了 {result.reduction}%
            </div>
            <p className="text-3xl font-black text-emerald-600">{formatSize(result.compressedSize)}</p>
            <p className="text-slate-400 text-sm mt-1">压缩后大小</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href={result.url}
            download={result.fileName}
            className="flex-grow flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-emerald-200 transition-all active:scale-95"
          >
            <Download size={20} />
            立即下载文件
          </a>
          <button
            onClick={onReset}
            className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 px-8 rounded-xl transition-all active:scale-95"
          >
            <Share2 size={20} />
            再压一个
          </button>
        </div>
      </div>
    </div>
  );
};
