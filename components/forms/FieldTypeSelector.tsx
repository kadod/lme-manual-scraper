'use client';

import { fieldConfigs } from '@/lib/field-configs';
import { FieldType } from '@/types/form';
import { Button } from '@/components/ui/button';
import { PlusIcon } from '@heroicons/react/24/outline';

interface FieldTypeSelectorProps {
  onSelectType: (type: FieldType) => void;
}

export function FieldTypeSelector({ onSelectType }: FieldTypeSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-foreground">フィールドを追加</h3>
      <div className="grid grid-cols-2 gap-2">
        {Object.values(fieldConfigs).map((config) => {
          const Icon = config.icon;
          return (
            <Button
              key={config.type}
              variant="outline"
              className="h-auto flex-col items-start gap-2 p-4"
              onClick={() => onSelectType(config.type)}
            >
              <div className="flex w-full items-center gap-2">
                <Icon className="size-4 text-muted-foreground" />
                <span className="text-sm font-medium">{config.label}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {config.description}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
