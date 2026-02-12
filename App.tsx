
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Upload, Settings, FileText, Download, RefreshCw, CheckCircle, AlertCircle, Terminal, Zap } from 'lucide-react';
import { DropZone } from './components/DropZone';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultCard } from './components/ResultCard';
import { compressPDF } from './services/pdfProcessor';
import { CompressionSettings, ProcessingResult, AppState } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [settings, setSettings] = useState<CompressionSettings>({ quality: 40, scale: 1.5 });
  const [state, setState] = useState<AppState>(AppState.IDLE);
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const logEndRef = useRef<HTMLDivElement>(null);

  // 估算逻辑：根据质量和缩放比例计算一个预期的压缩比
  const estimation = useMemo(() => {
    if (!file) return null;
    
    // 基础比率：假设 re-encoding 通常能减小到 60% (针对未压缩过的图片)
    const baseRatio = 0.6;
    // 缩放影响是平方级的 (像素面积)
    const scaleFactor = Math.pow(settings.scale / 2.0, 2);
    // 质量影响是非线性的
    const qualityFactor = Math.pow(settings.quality / 100, 0.7);
    
    const ratio = baseRatio * scaleFactor * qualityFactor;
    
    // 给出一个范围，因为 PDF 内容差异很大
    const min = file.size * ratio * 0.7;
    const max = file.size * ratio * 1.3;
    
    return {
      min: Math.min(min, file.size * 0.9), // 不超过原大小的90%
      max: Math.min(max, file.size * 1.1),
      percent: Math.max(5, Math.round((1 - ratio) * 100))
    };
  }, [file, settings]);

  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setResult(null);
    setState(AppState.IDLE);
    setLogs([]);
    setErrorMessage('');
  };

  const startCompression = async () => {
    if (!file) return;

    try {
      setState(AppState.PROCESSING);
      setLogs([]);
      setProgress(0);
      
      const compressedData = await compressPDF(
        file, 
        settings, 
        (p, log) => {
          setProgress(p);
          if (log) addLog(log);
        }
      );

      const url = URL.createObjectURL(new Blob([compressedData], { type: 'application/pdf' }));
      
      const res: ProcessingResult = {
        url,
        originalSize: file.size,
        compressedSize: compressedData.length,
        fileName: file.name.replace(/\.pdf$/i, '') + '_compressed.pdf',
        reduction: Math.round((1 - (compressedData.length / file.size)) * 100)
      };

      setResult(res);
      setState(AppState.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setState(AppState.ERROR);
      setErrorMessage(`处理失败: ${err.message || '未知错误'}`);
      addLog(`❌ 错误: ${err.message}`);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + ['B', 'KB', 'MB', 'GB'][i];
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setState(AppState.IDLE);
    setProgress(0);
    setLogs([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="gradient-bg text-white py-10 px-4 shadow-lg text-center">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-3 tracking-tight flex items-center justify-center gap-3">
           UltraPDF Squeezer
        </h1>
        <p className="text-indigo-100 font-medium">100% 浏览器本地处理 · 保护隐私 · 极致压缩</p>
      </header>

      <main className="flex-grow max-w-6xl mx-auto w-full px-4 -mt-6 mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Settings & Upload Area */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100">
              <div className="flex items-center gap-2 mb-4">
                <Upload className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">1. 选择 PDF 文件</h2>
              </div>
              
              {!file ? (
                <DropZone onFileSelect={handleFileSelect} />
              ) : (
                <div className="flex items-center justify-between p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="bg-indigo-600 p-3 rounded-xl text-white shadow-lg shadow-indigo-200">
                      <FileText size={28} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[200px] md:max-w-md">{file.name}</p>
                      <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
                        {formatSize(file.size)}
                      </p>
                    </div>
                  </div>
                  <button onClick={reset} className="p-2 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-red-500">
                    <RefreshCw size={20} />
                  </button>
                </div>
              )}
            </div>

            {/* Console Log Area */}
            {(state === AppState.PROCESSING || logs.length > 0) && (
              <div className="bg-slate-900 rounded-3xl shadow-2xl p-6 overflow-hidden flex flex-col h-[300px]">
                <div className="flex items-center gap-2 mb-4 text-slate-400 border-b border-slate-800 pb-3">
                  <Terminal size={18} />
                  <span className="text-xs font-mono uppercase tracking-widest">处理控制台</span>
                </div>
                <div className="flex-grow overflow-y-auto custom-scrollbar font-mono text-xs space-y-2 text-emerald-400">
                  {logs.map((log, i) => <div key={i}>{log}</div>)}
                  {state === AppState.PROCESSING && <div className="animate-pulse">_</div>}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

            {state === AppState.COMPLETED && result && (
              <ResultCard result={result} onReset={reset} />
            )}
          </div>

          {/* Sidebar Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl shadow-xl p-6 border border-slate-100 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-slate-800">2. 参数微调</h2>
              </div>

              <SettingsPanel 
                settings={settings} 
                onChange={setSettings} 
                disabled={state === AppState.PROCESSING} 
              />

              {/* Estimation Badge */}
              {file && state === AppState.IDLE && estimation && (
                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in zoom-in duration-300">
                  <div className="flex items-center gap-2 text-emerald-700 mb-2">
                    <Zap size={16} className="fill-emerald-500" />
                    <span className="text-xs font-bold uppercase tracking-wider">预计效果</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">预估大小</p>
                      <p className="text-lg font-black text-emerald-600">
                        {formatSize(estimation.min)} ~ {formatSize(estimation.max)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-emerald-500 bg-white px-2 py-1 rounded-full border border-emerald-100 shadow-sm">
                        预计缩小 {estimation.percent}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                disabled={!file || state === AppState.PROCESSING}
                onClick={startCompression}
                className={`w-full mt-6 py-5 rounded-2xl font-bold text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 text-lg
                  ${!file || state === AppState.PROCESSING 
                    ? 'bg-slate-300 cursor-not-allowed shadow-none' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-300'}`}
              >
                {state === AppState.PROCESSING ? (
                  <>
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    正在处理... {progress}%
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-6 h-6" />
                    立即开始压缩
                  </>
                )}
              </button>

              {errorMessage && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-xl text-sm border border-red-100 font-medium">
                  <AlertCircle size={20} className="shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="bg-slate-50 border-t border-slate-200 py-10 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-3">
          <p className="text-slate-400 text-sm">此工具基于开源技术栈构建：pdf-lib, pdf.js, React</p>
          <p className="text-slate-500 font-medium text-xs uppercase tracking-widest">
            本地处理 · 无服务器上传 · 安全可靠
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
