'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { CanvasEditor } from './CanvasEditor';
import { AreaSelector } from './AreaSelector';
import { ActionEditor } from './ActionEditor';
import { GridTemplates } from './GridTemplates';
import {
  createRichMenu,
  updateRichMenu,
  uploadRichMenuImage,
} from '@/app/actions/rich-menus';
import {
  RICH_MENU_SIZES,
  type RichMenuArea,
  type RichMenuSize,
  type RichMenuAction,
  type GridTemplate,
} from '@/lib/line/rich-menu-types';
import { cn } from '@/lib/utils';

interface RichMenuEditorProps {
  initialData?: {
    richMenuId?: string;
    name: string;
    chatBarText: string;
    size: RichMenuSize;
    selected: boolean;
    areas: RichMenuArea[];
  };
  mode: 'create' | 'edit';
}

export function RichMenuEditor({ initialData, mode }: RichMenuEditorProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialData?.name || '');
  const [chatBarText, setChatBarText] = useState(
    initialData?.chatBarText || ''
  );
  const [size, setSize] = useState<RichMenuSize>(
    initialData?.size || RICH_MENU_SIZES[0]
  );
  const [selected, setSelected] = useState(initialData?.selected || true);
  const [areas, setAreas] = useState<RichMenuArea[]>(
    initialData?.areas || []
  );
  const [selectedAreaIndex, setSelectedAreaIndex] = useState<number | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [editingAreaIndex, setEditingAreaIndex] = useState<number | null>(
    null
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(
    null
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('画像サイズは1MB以下にしてください');
      return;
    }

    if (!file.type.match(/^image\/(png|jpeg)$/)) {
      setError('PNG または JPEG 形式の画像を選択してください');
      return;
    }

    setImageFile(file);
    setError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTemplateSelect = (template: GridTemplate) => {
    setSelectedTemplate(template.id);
    const newAreas: RichMenuArea[] = template.areas.map((templateArea) => ({
      bounds: templateArea.bounds,
      action: {
        type: 'uri',
        uri: '',
      },
    }));
    setAreas(newAreas);
    setSelectedAreaIndex(null);
  };

  const handleAreaCreate = (newArea: Omit<RichMenuArea, 'action'>) => {
    if (areas.length >= 20) {
      setError('タップ領域は最大20個までです');
      return;
    }

    const areaWithAction: RichMenuArea = {
      ...newArea,
      action: {
        type: 'uri',
        uri: '',
      },
    };

    setAreas([...areas, areaWithAction]);
    setEditingAreaIndex(areas.length);
    setIsActionDialogOpen(true);
    setError(null);
  };

  const handleAreaDelete = (index: number) => {
    setAreas(areas.filter((_, i) => i !== index));
    if (selectedAreaIndex === index) {
      setSelectedAreaIndex(null);
    }
  };

  const handleAreaEdit = (index: number) => {
    setEditingAreaIndex(index);
    setIsActionDialogOpen(true);
  };

  const handleActionSave = (action: RichMenuAction) => {
    if (editingAreaIndex === null) return;

    const newAreas = [...areas];
    newAreas[editingAreaIndex] = {
      ...newAreas[editingAreaIndex],
      action,
    };
    setAreas(newAreas);
    setIsActionDialogOpen(false);
    setEditingAreaIndex(null);
  };

  const handleSizeChange = (newSize: RichMenuSize) => {
    setSize(newSize);
    setAreas([]);
    setSelectedAreaIndex(null);
    setSelectedTemplate(null);
  };

  const validateForm = () => {
    if (!name.trim()) {
      setError('リッチメニュー名を入力してください');
      return false;
    }

    if (!chatBarText.trim()) {
      setError('チャットバーテキストを入力してください');
      return false;
    }

    if (chatBarText.length > 14) {
      setError('チャットバーテキストは14文字以内で入力してください');
      return false;
    }

    if (!imageFile && mode === 'create') {
      setError('画像をアップロードしてください');
      return false;
    }

    if (areas.length === 0) {
      setError('少なくとも1つのタップ領域を作成してください');
      return false;
    }

    for (const area of areas) {
      if (area.action.type === 'uri' && !area.action.uri) {
        setError('すべてのタップ領域にアクションを設定してください');
        return false;
      }
      if (area.action.type === 'message' && !area.action.text) {
        setError('すべてのタップ領域にアクションを設定してください');
        return false;
      }
      if (area.action.type === 'postback' && !area.action.data) {
        setError('すべてのタップ領域にアクションを設定してください');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSaving(true);
    setError(null);

    try {
      const richMenuData = {
        name,
        chatBarText,
        size,
        selected,
        areas,
      };

      let result;
      if (mode === 'edit' && initialData?.richMenuId) {
        result = await updateRichMenu(initialData.richMenuId, richMenuData);
      } else {
        result = await createRichMenu(richMenuData);
      }

      if (!result.success) {
        setError(result.error || '保存に失敗しました');
        setIsSaving(false);
        return;
      }

      if (imageFile && result.richMenuId) {
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadResult = await uploadRichMenuImage(
          result.richMenuId,
          formData
        );

        if (!uploadResult.success) {
          setError(uploadResult.error || '画像のアップロードに失敗しました');
          setIsSaving(false);
          return;
        }
      }

      router.push('/dashboard/rich-menus');
    } catch (err) {
      setError(err instanceof Error ? err.message : '予期しないエラーが発生しました');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <Tabs defaultValue="basic" className="w-full">
        <TabsList>
          <TabsTrigger value="basic">基本設定</TabsTrigger>
          <TabsTrigger value="design">デザイン</TabsTrigger>
          <TabsTrigger value="areas">タップ領域</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div>
            <Label htmlFor="name">リッチメニュー名 *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: メインメニュー"
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              管理画面でのみ表示される名前です
            </p>
          </div>

          <div>
            <Label htmlFor="chatBarText">チャットバーテキスト *</Label>
            <Input
              id="chatBarText"
              value={chatBarText}
              onChange={(e) => setChatBarText(e.target.value)}
              placeholder="メニュー"
              maxLength={14}
              required
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              チャットバーに表示されるテキスト（14文字以内）
            </p>
          </div>

          <div>
            <Label>サイズ *</Label>
            <RadioGroup
              value={`${size.width}x${size.height}`}
              onValueChange={(value) => {
                const [width, height] = value.split('x').map(Number);
                handleSizeChange({
                  width: width as 2500,
                  height: height as 1686 | 843,
                });
              }}
              className="mt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2500x1686" id="size-large" />
                <Label htmlFor="size-large" className="font-normal cursor-pointer">
                  大 (2500x1686px)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="2500x843" id="size-small" />
                <Label htmlFor="size-small" className="font-normal cursor-pointer">
                  小 (2500x843px)
                </Label>
              </div>
            </RadioGroup>
          </div>
        </TabsContent>

        <TabsContent value="design" className="space-y-4">
          <div>
            <Label>画像アップロード *</Label>
            <div className="mt-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <PhotoIcon className="h-5 w-5 mr-2" />
                {imageFile ? imageFile.name : '画像を選択'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              PNG または JPEG 形式、サイズは {size.width}x{size.height}px、
              1MB以下
            </p>
          </div>

          {imageUrl && (
            <div className="border rounded-lg overflow-hidden">
              <img
                src={imageUrl}
                alt="Rich menu preview"
                className="w-full h-auto"
              />
            </div>
          )}

          <GridTemplates
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
          />
        </TabsContent>

        <TabsContent value="areas" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <CanvasEditor
                size={size}
                areas={areas}
                selectedAreaIndex={selectedAreaIndex}
                imageUrl={imageUrl}
                onAreaSelect={setSelectedAreaIndex}
                onAreaCreate={handleAreaCreate}
              />
            </div>

            <div>
              <AreaSelector
                areas={areas}
                selectedAreaIndex={selectedAreaIndex}
                onSelectArea={setSelectedAreaIndex}
                onDeleteArea={handleAreaDelete}
                onEditArea={handleAreaEdit}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex items-center justify-between pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSaving}
        >
          キャンセル
        </Button>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? '保存中...' : mode === 'edit' ? '更新' : '作成'}
        </Button>
      </div>

      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              タップ領域のアクション設定
              {editingAreaIndex !== null && ` #${editingAreaIndex + 1}`}
            </DialogTitle>
          </DialogHeader>

          {editingAreaIndex !== null && (
            <ActionEditor
              action={areas[editingAreaIndex]?.action || { type: 'uri' }}
              onActionChange={handleActionSave}
            />
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsActionDialogOpen(false);
                setEditingAreaIndex(null);
              }}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={() => {
                if (editingAreaIndex !== null) {
                  setIsActionDialogOpen(false);
                  setEditingAreaIndex(null);
                }
              }}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
