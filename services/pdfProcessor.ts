
import * as pdfLib from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import { CompressionSettings } from '../types';

// 配置 Worker 路径，确保在所有环境下可用
const PDFJS_VERSION = '4.0.379';
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.mjs`;

export async function compressPDF(
  file: File, 
  settings: CompressionSettings, 
  onProgress: (p: number, log?: string) => void
): Promise<Uint8Array> {
  const fileArrayBuffer = await file.arrayBuffer();
  
  onProgress(0, `📂 正在加载文件: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

  const loadingTask = pdfjsLib.getDocument({ data: fileArrayBuffer });
  const pdfDoc = await loadingTask.promise;
  const totalPages = pdfDoc.numPages;

  onProgress(5, `📄 PDF 加载成功，共 ${totalPages} 页`);

  const outputDoc = await pdfLib.PDFDocument.create();

  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i);
    // 这里的 scale 对应你 Python 里的 zoom
    const viewport = page.getViewport({ scale: settings.scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Canvas context failure');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // 渲染页面到 Canvas
    await page.render({
      canvasContext: context,
      viewport: viewport,
      intent: 'print'
    }).promise;

    // 压缩为 JPEG
    // 这里的 quality 对应你 Python 里的 jpg_quality
    const quality = settings.quality / 100;
    const jpegDataUrl = canvas.toDataURL('image/jpeg', quality);
    
    // 转换为字节数组并嵌入
    const response = await fetch(jpegDataUrl);
    const jpegBytes = await response.arrayBuffer();
    const embeddedImage = await outputDoc.embedJpg(jpegBytes);
    
    // 创建新页面，保持原始比例（但在 pdf-lib 中，单位是 points）
    const imageDims = embeddedImage.scale(1 / settings.scale);
    const newPage = outputDoc.addPage([imageDims.width, imageDims.height]);
    
    newPage.drawImage(embeddedImage, {
      x: 0,
      y: 0,
      width: imageDims.width,
      height: imageDims.height,
    });

    const progress = 5 + Math.round((i / totalPages) * 90);
    onProgress(progress, `   -> 已处理第 ${i} / ${totalPages} 页...`);

    // 关键：清理内存，避免大文件 OOM
    canvas.width = 0;
    canvas.height = 0;
    
    // 释放主线程一小会儿，让 UI 刷新日志
    await new Promise(resolve => setTimeout(resolve, 10));
  }

  onProgress(95, '💾 正在优化结构并导出文件...');
  
  // 保存并清理无用对象
  const finalPdfBytes = await outputDoc.save({
    useObjectStreams: true,
    addDefaultPage: false
  });

  onProgress(100, `✅ 压缩完成！新大小约: ${(finalPdfBytes.length / 1024 / 1024).toFixed(2)} MB`);
  
  return finalPdfBytes;
}
