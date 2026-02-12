
import React from 'react';
import { CompressionSettings } from '../types';

interface SettingsPanelProps {
  settings: CompressionSettings;
  onChange: (settings: CompressionSettings) => void;
  disabled: boolean;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onChange, disabled }) => {
  return (
    <div className="space-y-8">
      {/* Quality Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            图片质量 (Quality)
          </label>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">
            {settings.quality}%
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="100"
          value={settings.quality}
          disabled={disabled}
          onChange={(e) => onChange({ ...settings, quality: parseInt(e.target.value) })}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>最小文件 (1)</span>
          <span>高画质 (100)</span>
        </div>
      </div>

      {/* Resolution Scale Slider */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-semibold text-slate-700 uppercase tracking-wider">
            分辨率缩放 (Zoom)
          </label>
          <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded text-sm font-bold">
            {settings.scale}x
          </span>
        </div>
        <input
          type="range"
          min="0.5"
          max="3.0"
          step="0.1"
          value={settings.scale}
          disabled={disabled}
          onChange={(e) => onChange({ ...settings, scale: parseFloat(e.target.value) })}
          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600 disabled:opacity-50"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-medium">
          <span>模糊 (0.5x)</span>
          <span>超清 (3.0x)</span>
        </div>
      </div>
      
      {/* Quick Presets */}
      <div className="pt-2">
         <p className="text-xs font-semibold text-slate-500 mb-3">快捷预设</p>
         <div className="grid grid-cols-3 gap-2">
            <button 
                disabled={disabled}
                onClick={() => onChange({ quality: 20, scale: 0.8 })}
                className="text-[10px] py-2 border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
                极限压缩
            </button>
            <button 
                disabled={disabled}
                onClick={() => onChange({ quality: 40, scale: 1.5 })}
                className="text-[10px] py-2 border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
                推荐平衡
            </button>
            <button 
                disabled={disabled}
                onClick={() => onChange({ quality: 80, scale: 2.0 })}
                className="text-[10px] py-2 border border-slate-200 rounded-lg hover:border-indigo-400 hover:text-indigo-600 transition-colors"
            >
                保持清晰
            </button>
         </div>
      </div>
    </div>
  );
};
