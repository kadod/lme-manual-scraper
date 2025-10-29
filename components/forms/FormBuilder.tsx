'use client';

import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FieldType } from '@/types/form';
import { FieldTypeSelector } from './FieldTypeSelector';
import { FieldEditor } from './FieldEditor';
import { FormPreview } from './FormPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EyeIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { fieldConfigs } from '@/lib/field-configs';

interface FormBuilderProps {
  formTitle: string;
  formDescription?: string;
  formThanksMessage?: string;
  initialFields?: FormField[];
  onSave: (data: {
    title: string;
    description?: string;
    thanksMessage?: string;
    fields: FormField[];
  }) => void;
}

function SortableField({
  field,
  onUpdate,
  onDelete,
}: {
  field: FormField;
  onUpdate: (field: FormField) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <FieldEditor
        field={field}
        onUpdate={onUpdate}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

export function FormBuilder({
  formTitle: initialTitle,
  formDescription: initialDescription,
  formThanksMessage: initialThanksMessage,
  initialFields = [],
  onSave,
}: FormBuilderProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription || '');
  const [thanksMessage, setThanksMessage] = useState(initialThanksMessage || '');
  const [fields, setFields] = useState<FormField[]>(initialFields);
  const [activeTab, setActiveTab] = useState('build');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addField = (type: FieldType) => {
    const config = fieldConfigs[type];
    const newField: FormField = {
      id: `field_${Date.now()}`,
      type,
      label: config.label,
      placeholder: config.defaultPlaceholder,
      required: false,
      order: fields.length,
      validation: [],
      options: config.supportsOptions
        ? [
            { label: '選択肢1', value: 'option1' },
            { label: '選択肢2', value: 'option2' },
          ]
        : undefined,
    };
    setFields([...fields, newField]);
  };

  const updateField = (id: string, updatedField: FormField) => {
    setFields(fields.map((f) => (f.id === id ? updatedField : f)));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        const reordered = arrayMove(items, oldIndex, newIndex);
        return reordered.map((field, index) => ({ ...field, order: index }));
      });
    }
  };

  const handleSave = () => {
    onSave({
      title,
      description,
      thanksMessage,
      fields,
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="form-title">フォームタイトル</Label>
          <Input
            id="form-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="お問い合わせフォーム"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-description">フォーム説明</Label>
          <Textarea
            id="form-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="このフォームについての説明"
            rows={2}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="form-thanks">サンクスメッセージ</Label>
          <Textarea
            id="form-thanks"
            value={thanksMessage}
            onChange={(e) => setThanksMessage(e.target.value)}
            placeholder="ご送信ありがとうございました"
            rows={2}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="build" className="flex items-center gap-2">
            <Cog6ToothIcon className="size-4" />
            編集
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <EyeIcon className="size-4" />
            プレビュー
          </TabsTrigger>
        </TabsList>

        <TabsContent value="build" className="space-y-6 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4">フィールド</h3>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={fields.map((f) => f.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {fields.map((field) => (
                        <SortableField
                          key={field.id}
                          field={field}
                          onUpdate={(updated) => updateField(field.id, updated)}
                          onDelete={() => deleteField(field.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>

                {fields.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground border border-dashed rounded-lg">
                    右側からフィールドを追加してください
                  </div>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-6">
                <FieldTypeSelector onSelectType={addField} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-6">
          <FormPreview
            title={title}
            description={description}
            fields={fields}
            thanksMessage={thanksMessage}
          />
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3 pt-6 border-t border-border">
        <Button variant="outline" onClick={() => window.history.back()}>
          キャンセル
        </Button>
        <Button onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}
