'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormBuilder } from '@/components/forms/FormBuilder';
import { Form, FormField } from '@/types/form';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface PageProps {
  params: {
    id: string;
  };
}

export default function FormEditPage({ params }: PageProps) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [params.id]);

  const loadForm = async () => {
    try {
      if (params.id === 'new') {
        // 新規作成
        setForm({
          id: 'new',
          title: '新規フォーム',
          description: '',
          thanksMessage: 'ご送信ありがとうございました。',
          fields: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      } else {
        // 既存フォーム読み込み（API実装時に対応）
        // const response = await fetch(`/api/forms/${params.id}`);
        // const data = await response.json();
        // setForm(data);

        // ダミーデータ
        setForm({
          id: params.id,
          title: 'お問い合わせフォーム',
          description: 'お気軽にお問い合わせください',
          thanksMessage: 'お問い合わせありがとうございました。3営業日以内にご返信いたします。',
          fields: [
            {
              id: 'field_1',
              type: 'text',
              label: 'お名前',
              placeholder: '山田太郎',
              required: true,
              order: 0,
              validation: [
                { type: 'required', message: 'お名前は必須です', value: true },
              ],
            },
            {
              id: 'field_2',
              type: 'email',
              label: 'メールアドレス',
              placeholder: 'example@email.com',
              required: true,
              order: 1,
              validation: [
                { type: 'required', message: 'メールアドレスは必須です', value: true },
              ],
            },
          ],
          createdAt: '2025-10-29T00:00:00Z',
          updatedAt: '2025-10-29T00:00:00Z',
        });
      }
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (data: {
    title: string;
    description?: string;
    thanksMessage?: string;
    fields: FormField[];
  }) => {
    try {
      // API実装時に対応
      // const response = await fetch(`/api/forms/${params.id}`, {
      //   method: params.id === 'new' ? 'POST' : 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(data),
      // });

      console.log('Saving form:', data);

      // 一時的に成功として処理
      alert('フォームを保存しました');
      router.push('/dashboard/forms');
    } catch (error) {
      console.error('Failed to save form:', error);
      alert('フォームの保存に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-destructive">フォームが見つかりません</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="size-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {params.id === 'new' ? '新規フォーム作成' : 'フォーム編集'}
              </h1>
              <p className="text-sm text-muted-foreground">
                フォームのフィールドを追加・編集して保存してください
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FormBuilder
          formTitle={form.title}
          formDescription={form.description}
          formThanksMessage={form.thanksMessage}
          initialFields={form.fields}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
