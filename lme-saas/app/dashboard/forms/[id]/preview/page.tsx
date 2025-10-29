'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FormPreview } from '@/components/forms/FormPreview';
import { Form } from '@/types/form';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface PageProps {
  params: {
    id: string;
  };
}

export default function FormPreviewPage({ params }: PageProps) {
  const router = useRouter();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadForm();
  }, [params.id]);

  const loadForm = async () => {
    try {
      // API実装時に対応
      // const response = await fetch(`/api/forms/${params.id}`);
      // const data = await response.json();
      // setForm(data);

      // ダミーデータ
      setForm({
        id: params.id,
        title: 'お問い合わせフォーム',
        description: 'お気軽にお問い合わせください。通常3営業日以内にご返信いたします。',
        thanksMessage: 'お問い合わせありがとうございました。3営業日以内にご返信いたします。',
        fields: [
          {
            id: 'field_1',
            type: 'text',
            label: 'お名前',
            placeholder: '山田太郎',
            helpText: '姓名をご入力ください',
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
            helpText: '返信用のメールアドレスをご入力ください',
            required: true,
            order: 1,
            validation: [
              { type: 'required', message: 'メールアドレスは必須です', value: true },
            ],
          },
          {
            id: 'field_3',
            type: 'tel',
            label: '電話番号',
            placeholder: '000-0000-0000',
            helpText: 'ハイフンありでご入力ください',
            required: false,
            order: 2,
          },
          {
            id: 'field_4',
            type: 'select',
            label: 'お問い合わせ種別',
            placeholder: '選択してください',
            required: true,
            order: 3,
            options: [
              { label: '商品について', value: 'product' },
              { label: 'サービスについて', value: 'service' },
              { label: '料金について', value: 'pricing' },
              { label: 'その他', value: 'other' },
            ],
            validation: [
              { type: 'required', message: 'お問い合わせ種別は必須です', value: true },
            ],
          },
          {
            id: 'field_5',
            type: 'textarea',
            label: 'お問い合わせ内容',
            placeholder: 'お問い合わせ内容を詳しくご記入ください',
            required: true,
            order: 4,
            validation: [
              { type: 'required', message: 'お問い合わせ内容は必須です', value: true },
              { type: 'minLength', message: '10文字以上入力してください', value: '10' },
            ],
          },
        ],
        createdAt: '2025-10-29T00:00:00Z',
        updatedAt: '2025-10-29T00:00:00Z',
      });
    } catch (error) {
      console.error('Failed to load form:', error);
    } finally {
      setLoading(false);
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
          <div className="flex items-center justify-between">
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
                  フォームプレビュー
                </h1>
                <p className="text-sm text-muted-foreground">
                  {form.title}
                </p>
              </div>
            </div>
            <Link href={`/dashboard/forms/${params.id}/edit`}>
              <Button variant="outline">
                <PencilIcon className="size-4" />
                編集
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <FormPreview
          title={form.title}
          description={form.description}
          fields={form.fields}
          thanksMessage={form.thanksMessage}
        />
      </div>
    </div>
  );
}
