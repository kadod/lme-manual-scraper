'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { RichMenuAction } from '@/lib/line/rich-menu-types';

interface ActionEditorProps {
  action: RichMenuAction;
  onActionChange: (action: RichMenuAction) => void;
}

export function ActionEditor({ action, onActionChange }: ActionEditorProps) {
  const [actionType, setActionType] = useState<RichMenuAction['type']>(
    action.type || 'uri'
  );

  const handleTypeChange = (type: RichMenuAction['type']) => {
    setActionType(type);
    onActionChange({
      type,
      label: action.label,
    });
  };

  const handleValueChange = (key: string, value: string) => {
    onActionChange({
      ...action,
      [key]: value,
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label>アクションタイプ</Label>
        <RadioGroup
          value={actionType}
          onValueChange={(value) =>
            handleTypeChange(value as RichMenuAction['type'])
          }
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="uri" id="type-uri" />
            <Label htmlFor="type-uri" className="font-normal cursor-pointer">
              URLを開く
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="message" id="type-message" />
            <Label
              htmlFor="type-message"
              className="font-normal cursor-pointer"
            >
              メッセージ送信
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="postback" id="type-postback" />
            <Label
              htmlFor="type-postback"
              className="font-normal cursor-pointer"
            >
              Postbackデータ
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div>
        <Label htmlFor="action-label">ラベル（任意）</Label>
        <Input
          id="action-label"
          value={action.label || ''}
          onChange={(e) => handleValueChange('label', e.target.value)}
          placeholder="アクションの説明"
          className="mt-1"
        />
      </div>

      {actionType === 'uri' && (
        <div>
          <Label htmlFor="action-uri">URL *</Label>
          <Input
            id="action-uri"
            type="url"
            value={action.uri || ''}
            onChange={(e) => handleValueChange('uri', e.target.value)}
            placeholder="https://example.com"
            required
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            httpsから始まるURLを入力してください
          </p>
        </div>
      )}

      {actionType === 'message' && (
        <div>
          <Label htmlFor="action-text">送信テキスト *</Label>
          <Input
            id="action-text"
            value={action.text || ''}
            onChange={(e) => handleValueChange('text', e.target.value)}
            placeholder="送信するメッセージ"
            required
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            タップ時にユーザーが送信するメッセージ
          </p>
        </div>
      )}

      {actionType === 'postback' && (
        <div>
          <Label htmlFor="action-data">Postbackデータ *</Label>
          <Input
            id="action-data"
            value={action.data || ''}
            onChange={(e) => handleValueChange('data', e.target.value)}
            placeholder="action=buy&item=123"
            required
            className="mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            サーバーに送信するデータ（最大300文字）
          </p>
        </div>
      )}
    </div>
  );
}
