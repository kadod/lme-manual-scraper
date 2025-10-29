'use client';

import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { RichMenuArea } from '@/lib/line/rich-menu-types';

interface AreaSelectorProps {
  areas: RichMenuArea[];
  selectedAreaIndex: number | null;
  onSelectArea: (index: number) => void;
  onDeleteArea: (index: number) => void;
  onEditArea: (index: number) => void;
}

export function AreaSelector({
  areas,
  selectedAreaIndex,
  onSelectArea,
  onDeleteArea,
  onEditArea,
}: AreaSelectorProps) {
  const getActionTypeLabel = (type: string) => {
    switch (type) {
      case 'uri':
        return 'URLを開く';
      case 'message':
        return 'メッセージ';
      case 'postback':
        return 'Postback';
      default:
        return '未設定';
    }
  };

  const getActionValue = (action: RichMenuArea['action']) => {
    if (action.type === 'uri') return action.uri;
    if (action.type === 'message') return action.text;
    if (action.type === 'postback') return action.data;
    return '未設定';
  };

  if (areas.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>タップ領域がまだ作成されていません</p>
        <p className="text-xs mt-2">
          キャンバス上でドラッグして領域を作成してください
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">
          タップ領域 ({areas.length}/20)
        </h3>
      </div>

      <div className="space-y-2">
        {areas.map((area, index) => (
          <div
            key={index}
            onClick={() => onSelectArea(index)}
            className={cn(
              'p-3 border rounded-lg cursor-pointer transition-colors',
              selectedAreaIndex === index
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50'
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {index + 1}
                  </span>
                  <span className="text-sm font-medium">
                    {getActionTypeLabel(area.action.type)}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">位置:</span>
                    <span>
                      ({area.bounds.x}, {area.bounds.y})
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">サイズ:</span>
                    <span>
                      {area.bounds.width} x {area.bounds.height}
                    </span>
                  </div>
                  {area.action.type && (
                    <div className="flex items-center gap-1">
                      <span className="font-medium">値:</span>
                      <span className="truncate">
                        {getActionValue(area.action) || '未設定'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditArea(index);
                  }}
                  className="h-8 w-8"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteArea(index);
                  }}
                  className="h-8 w-8 text-destructive hover:text-destructive"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
