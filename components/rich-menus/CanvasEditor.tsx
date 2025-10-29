'use client';

import { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import type { RichMenuArea, RichMenuSize } from '@/lib/line/rich-menu-types';

interface CanvasEditorProps {
  size: RichMenuSize;
  areas: RichMenuArea[];
  selectedAreaIndex: number | null;
  imageUrl: string | null;
  onAreaSelect: (index: number | null) => void;
  onAreaCreate: (area: Omit<RichMenuArea, 'action'>) => void;
  className?: string;
}

export function CanvasEditor({
  size,
  areas,
  selectedAreaIndex,
  imageUrl,
  onAreaSelect,
  onAreaCreate,
  className,
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [dragEnd, setDragEnd] = useState<{ x: number; y: number } | null>(
    null
  );
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = size.height === 1686 ? 539 : 270;

  useEffect(() => {
    const newScale = CANVAS_WIDTH / size.width;
    setScale(newScale);
  }, [size.width]);

  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.onload = () => setImage(img);
      img.src = imageUrl;
    } else {
      setImage(null);
    }
  }, [imageUrl]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (image) {
      ctx.drawImage(image, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    } else {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      ctx.fillStyle = '#9ca3af';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(
        '画像をアップロードしてください',
        CANVAS_WIDTH / 2,
        CANVAS_HEIGHT / 2
      );
    }

    areas.forEach((area, index) => {
      const x = area.bounds.x * scale;
      const y = area.bounds.y * scale;
      const width = area.bounds.width * scale;
      const height = area.bounds.height * scale;

      const isSelected = index === selectedAreaIndex;

      ctx.strokeStyle = isSelected ? '#3b82f6' : '#6366f1';
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = isSelected
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(99, 102, 241, 0.1)';
      ctx.fillRect(x, y, width, height);

      ctx.fillStyle = isSelected ? '#1e40af' : '#4338ca';
      ctx.font = 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}`, x + width / 2, y + height / 2 + 5);
    });

    if (isDragging && dragStart && dragEnd) {
      const x = Math.min(dragStart.x, dragEnd.x);
      const y = Math.min(dragStart.y, dragEnd.y);
      const width = Math.abs(dragEnd.x - dragStart.x);
      const height = Math.abs(dragEnd.y - dragStart.y);

      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(x, y, width, height);

      ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
      ctx.fillRect(x, y, width, height);
      ctx.setLineDash([]);
    }
  }, [
    areas,
    selectedAreaIndex,
    isDragging,
    dragStart,
    dragEnd,
    image,
    scale,
    CANVAS_WIDTH,
    CANVAS_HEIGHT,
  ]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const coords = getCanvasCoordinates(e);

    const clickedAreaIndex = areas.findIndex((area) => {
      const x = area.bounds.x * scale;
      const y = area.bounds.y * scale;
      const width = area.bounds.width * scale;
      const height = area.bounds.height * scale;

      return (
        coords.x >= x &&
        coords.x <= x + width &&
        coords.y >= y &&
        coords.y <= y + height
      );
    });

    if (clickedAreaIndex !== -1) {
      onAreaSelect(clickedAreaIndex);
      return;
    }

    onAreaSelect(null);
    setIsDragging(true);
    setDragStart(coords);
    setDragEnd(coords);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const coords = getCanvasCoordinates(e);
    setDragEnd(coords);
  };

  const handleMouseUp = () => {
    if (!isDragging || !dragStart || !dragEnd) {
      setIsDragging(false);
      return;
    }

    const x = Math.min(dragStart.x, dragEnd.x);
    const y = Math.min(dragStart.y, dragEnd.y);
    const width = Math.abs(dragEnd.x - dragStart.x);
    const height = Math.abs(dragEnd.y - dragStart.y);

    if (width > 20 && height > 20) {
      const originalX = Math.round(x / scale);
      const originalY = Math.round(y / scale);
      const originalWidth = Math.round(width / scale);
      const originalHeight = Math.round(height / scale);

      onAreaCreate({
        bounds: {
          x: originalX,
          y: originalY,
          width: originalWidth,
          height: originalHeight,
        },
      });
    }

    setIsDragging(false);
    setDragStart(null);
    setDragEnd(null);
  };

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          ドラッグしてタップ領域を作成
        </div>
        <div className="text-xs text-muted-foreground">
          {size.width}x{size.height}px
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-muted">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair w-full"
        />
      </div>

      <div className="text-xs text-muted-foreground space-y-1">
        <p>使い方:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>ドラッグして新しいタップ領域を作成</li>
          <li>既存の領域をクリックして選択・編集</li>
          <li>最大20個の領域を作成できます</li>
        </ul>
      </div>
    </div>
  );
}
