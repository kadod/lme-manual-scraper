'use client';

import { GRID_TEMPLATES, type GridTemplate } from '@/lib/line/rich-menu-types';
import { cn } from '@/lib/utils';

interface GridTemplatesProps {
  selectedTemplate: string | null;
  onSelectTemplate: (template: GridTemplate) => void;
}

export function GridTemplates({
  selectedTemplate,
  onSelectTemplate,
}: GridTemplatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">グリッドテンプレート</h3>
        <p className="text-xs text-muted-foreground">
          プリセットのグリッドレイアウトを選択してください
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GRID_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelectTemplate(template)}
            className={cn(
              'p-4 border-2 rounded-lg hover:border-primary transition-colors',
              selectedTemplate === template.id
                ? 'border-primary bg-primary/5'
                : 'border-border'
            )}
          >
            <div className="space-y-2">
              <div className="font-medium text-sm">{template.name}</div>
              <div className="flex items-center justify-center h-24 bg-muted rounded">
                <div
                  className="grid gap-1 w-full h-full p-2"
                  style={{
                    gridTemplateColumns: `repeat(${template.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${template.rows}, 1fr)`,
                  }}
                >
                  {template.areas.map((_, index) => (
                    <div
                      key={index}
                      className="border border-border bg-background rounded"
                    />
                  ))}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
