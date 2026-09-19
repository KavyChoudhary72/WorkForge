import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, ZoomIn, ZoomOut, RotateCcw, RotateCw, Check, X, Crop, Image as ImageIcon } from 'lucide-react';

export default function ImageCropperModal({
  isOpen,
  onClose,
  onCropSave,
  title = 'Crop Custom Image',
  cropShape = 'square' // 'square' | 'circle'
}) {
  const [imageSrc, setImageSrc] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  // Reset state on open/close
  useEffect(() => {
    if (!isOpen) {
      setImageSrc(null);
      setZoom(1);
      setRotation(0);
      setPanX(0);
      setPanY(0);
    }
  }, [isOpen]);

  // Draw crop preview on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    const size = 300;
    canvas.width = size;
    canvas.height = size;

    ctx.clearRect(0, 0, size, size);
    ctx.save();

    // Move to center
    ctx.translate(size / 2 + panX, size / 2 + panY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered
    const aspect = img.width / img.height;
    let drawWidth = size;
    let drawHeight = size;

    if (aspect > 1) {
      drawHeight = size / aspect;
    } else {
      drawWidth = size * aspect;
    }

    ctx.drawImage(img, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
    ctx.restore();
  }, [panX, panY, rotation, zoom]);

  useEffect(() => {
    if (isOpen && imageSrc && imgRef.current) {
      drawCanvas();
    }
  }, [isOpen, imageSrc, drawCanvas]);

  // ALWAYS call hooks before conditional returns to obey Rules of Hooks
  if (!isOpen) return null;

  // Handle native file selection from File Manager
  const handleFileSelect = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imgRef.current = img;
        setImageSrc(reader.result);
        setZoom(1);
        setRotation(0);
        setPanX(0);
        setPanY(0);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  // Mouse Drag to Pan Image
  const handleMouseDown = (e) => {
    if (!imageSrc) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Generate cropped output image
  const handleSaveCrop = () => {
    if (!canvasRef.current || !imageSrc) return;

    const exportCanvas = document.createElement('canvas');
    const exportSize = 400;
    exportCanvas.width = exportSize;
    exportCanvas.height = exportSize;
    const ctx = exportCanvas.getContext('2d');

    if (cropShape === 'circle') {
      ctx.beginPath();
      ctx.arc(exportSize / 2, exportSize / 2, exportSize / 2, 0, Math.PI * 2);
      ctx.clip();
    }

    ctx.drawImage(canvasRef.current, 0, 0, 300, 300, 0, 0, exportSize, exportSize);

    const croppedDataUrl = exportCanvas.toDataURL('image/png', 0.95);
    onCropSave(croppedDataUrl);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/75 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2">
            <Crop className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">{title}</h3>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/png, image/jpeg, image/webp, image/gif"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* Main Crop Area */}
        {!imageSrc ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-600 dark:hover:border-blue-500 rounded-2xl p-10 text-center cursor-pointer bg-slate-50 dark:bg-slate-950 transition-colors flex flex-col items-center justify-center space-y-3"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Upload className="w-7 h-7" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                Click to Open Device File Manager
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Supports PNG, JPG, WEBP, or GIF image files
              </p>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition-colors inline-flex items-center"
            >
              <ImageIcon className="w-4 h-4 mr-1.5" /> Select Image File
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Interactive Canvas Viewport */}
            <div className="relative flex justify-center items-center bg-slate-950 rounded-2xl overflow-hidden p-4 select-none">
              <div
                className={`relative overflow-hidden border-2 border-blue-500 shadow-2xl cursor-grab active:cursor-grabbing ${
                  cropShape === 'circle' ? 'rounded-full' : 'rounded-2xl'
                }`}
                style={{ width: 280, height: 280 }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas ref={canvasRef} className="pointer-events-none" />
              </div>
            </div>

            {/* Cropping Controls Toolbar */}
            <div className="p-3 bg-slate-100 dark:bg-slate-800/80 rounded-xl space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span className="flex items-center">
                  <ZoomIn className="w-4 h-4 mr-1 text-blue-600" /> Zoom Level: {zoom.toFixed(1)}x
                </span>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setRotation(r => r - 90)}
                    className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-slate-800 dark:text-slate-200"
                    title="Rotate Left"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setRotation(r => r + 90)}
                    className="p-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 rounded-lg text-slate-800 dark:text-slate-200"
                    title="Rotate Right"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-2.5 py-1 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 rounded-lg font-bold text-[11px]"
                  >
                    Change File
                  </button>
                </div>
              </div>

              <input
                type="range"
                min="0.5"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-300 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end space-x-3 pt-2 border-t border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-700 dark:text-slate-300 font-bold hover:underline text-xs"
          >
            Cancel
          </button>
          {imageSrc && (
            <button
              type="button"
              onClick={handleSaveCrop}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-600/20 inline-flex items-center"
            >
              <Check className="w-4 h-4 mr-1.5" /> Save & Crop Image
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
