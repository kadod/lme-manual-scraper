'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PencilIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckCircleIcon,
  RocketLaunchIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  deleteRichMenu,
  duplicateRichMenu,
  setAsDefault,
  deployRichMenu,
  undeployRichMenu,
} from '@/app/actions/rich-menus';
import { useRouter } from 'next/navigation';

interface RichMenu {
  rich_menu_id: string;
  name: string;
  chat_bar_text: string;
  size: {
    width: number;
    height: number;
  };
  areas: unknown[];
  status?: string;
  is_default?: boolean;
  line_rich_menu_id?: string | null;
  created_at: string;
}

interface RichMenuListProps {
  initialMenus: RichMenu[];
}

export function RichMenuList({ initialMenus }: RichMenuListProps) {
  const router = useRouter();
  const [menus, setMenus] = useState(initialMenus);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMenuId, setSelectedMenuId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    if (!selectedMenuId) return;

    setIsLoading(true);
    const result = await deleteRichMenu(selectedMenuId);

    if (result.success) {
      setMenus(menus.filter((m) => m.rich_menu_id !== selectedMenuId));
      setDeleteDialogOpen(false);
      setSelectedMenuId(null);
    }
    setIsLoading(false);
  };

  const handleDuplicate = async (menuId: string) => {
    setIsLoading(true);
    const result = await duplicateRichMenu(menuId);

    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleSetDefault = async (menuId: string) => {
    setIsLoading(true);
    const result = await setAsDefault(menuId);

    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleDeploy = async (menuId: string) => {
    setIsLoading(true);
    const result = await deployRichMenu({ richMenuId: menuId });

    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  };

  const handleUndeploy = async (menuId: string) => {
    setIsLoading(true);
    const result = await undeployRichMenu(menuId);

    if (result.success) {
      router.refresh();
    }
    setIsLoading(false);
  };

  if (menus.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <RocketLaunchIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">
              リッチメニューがありません
            </h3>
            <p className="text-muted-foreground mb-6">
              最初のリッチメニューを作成して、ユーザーに表示しましょう
            </p>
            <Link href="/dashboard/rich-menus/new">
              <Button>
                <RocketLaunchIcon className="h-5 w-5 mr-2" />
                新規作成
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menus.map((menu) => (
          <Card key={menu.rich_menu_id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-lg truncate">
                    {menu.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {menu.chat_bar_text}
                  </CardDescription>
                </div>
                {menu.is_default && (
                  <Badge variant="default" className="ml-2">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    デフォルト
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">サイズ:</span>
                  <span className="font-medium">
                    {menu.size.width}x{menu.size.height}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">タップ領域:</span>
                  <span className="font-medium">
                    {menu.areas?.length || 0}個
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">ステータス:</span>
                  <Badge
                    variant={
                      menu.line_rich_menu_id ? 'default' : 'secondary'
                    }
                  >
                    {menu.line_rich_menu_id ? 'デプロイ済み' : '下書き'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/rich-menus/${menu.rich_menu_id}/edit`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={isLoading}
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      編集
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(menu.rich_menu_id)}
                    disabled={isLoading}
                  >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedMenuId(menu.rich_menu_id);
                      setDeleteDialogOpen(true);
                    }}
                    disabled={isLoading}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>

                {menu.line_rich_menu_id ? (
                  <div className="flex items-center gap-2">
                    {!menu.is_default && (
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleSetDefault(menu.rich_menu_id)}
                        disabled={isLoading}
                      >
                        <CheckCircleIcon className="h-4 w-4 mr-2" />
                        デフォルトに設定
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUndeploy(menu.rich_menu_id)}
                      disabled={isLoading}
                    >
                      <EyeSlashIcon className="h-4 w-4 mr-2" />
                      非公開
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={() => handleDeploy(menu.rich_menu_id)}
                    disabled={isLoading}
                  >
                    <RocketLaunchIcon className="h-4 w-4 mr-2" />
                    デプロイ
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>リッチメニューを削除</AlertDialogTitle>
            <AlertDialogDescription>
              このリッチメニューを削除してもよろしいですか？
              この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              キャンセル
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? '削除中...' : '削除'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
