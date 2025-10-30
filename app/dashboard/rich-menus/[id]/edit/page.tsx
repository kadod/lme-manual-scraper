import { RichMenuEditor } from '@/components/rich-menus/RichMenuEditor';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata = {
  title: 'リッチメニュー編集 | L Message',
  description: 'リッチメニューを編集',
};

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditRichMenuPage({ params }: PageProps) {
  const supabase = await createClient();
  const resolvedParams = await params;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: richMenu, error } = await supabase
    .from('rich_menus')
    .select('*')
    .eq('id', resolvedParams.id)
    .single();

  if (error || !richMenu) {
    redirect('/dashboard/rich-menus');
  }

  return (
    <div className="container max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/rich-menus"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              リッチメニュー編集
            </h1>
            <p className="text-muted-foreground mt-2">
              {richMenu.name}の設定を編集します
            </p>
          </div>
        </div>

        <RichMenuEditor
          mode="edit"
          initialData={{
            richMenuId: richMenu.line_rich_menu_id || undefined,
            name: richMenu.name,
            chatBarText: richMenu.chat_bar_text,
            size: {
              width: 2500,
              height: richMenu.size_height as 1686 | 843
            },
            selected: richMenu.is_default ?? false,
            areas: [],
          }}
        />
      </div>
    </div>
  );
}
