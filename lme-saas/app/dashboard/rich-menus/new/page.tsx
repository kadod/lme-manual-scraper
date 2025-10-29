import { RichMenuEditor } from '@/components/rich-menus/RichMenuEditor';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export const metadata = {
  title: 'リッチメニュー作成 | L Message',
  description: '新しいリッチメニューを作成',
};

export default async function NewRichMenuPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
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
              リッチメニュー作成
            </h1>
            <p className="text-muted-foreground mt-2">
              新しいリッチメニューを作成してユーザーに表示します
            </p>
          </div>
        </div>

        <RichMenuEditor mode="create" />
      </div>
    </div>
  );
}
