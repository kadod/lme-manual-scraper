# L Message（エルメ）SaaS 完全実装TODO

**Claude Code実装用 - コピペ実行可能な超詳細TODOリスト**

---

## 📊 プロジェクト概要

- **目標**: エルメ（LINE公式アカウント拡張ツール）の完全コピーSaaS構築
- **技術スタック**: Next.js 15 + Supabase + TypeScript + Tailwind CSS + shadcn/ui
- **総期間**: 12-16週間（3-4ヶ月）
- **総タスク数**: 150+

---

## 🎯 Phase 1: 環境セットアップ (Week 1)

### 1.1 Next.js 15プロジェクト作成

**所要時間**: 15分

```bash
# 1. Next.js 15プロジェクト作成
npx create-next-app@latest lme-saas \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"

cd lme-saas

# 2. Git初期化
git init
git add .
git commit -m "Initial commit: Next.js 15 setup"
```

**成果物**: `/lme-saas/` プロジェクトフォルダ

---

### 1.2 依存関係インストール

**所要時間**: 10分

```bash
# Supabase
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs @supabase/ssr

# 状態管理・データフェッチング
npm install zustand @tanstack/react-query

# UI コンポーネント
npx shadcn-ui@latest init

# フォーム・バリデーション
npm install react-hook-form @hookform/resolvers zod

# 日付・時刻
npm install date-fns

# アイコン
npm install lucide-react

# 開発ツール
npm install -D @types/node
```

**成果物**: `package.json` に全依存関係追加

---

### 1.3 環境変数設定

**所要時間**: 5分

**ファイル**: `.env.local`

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LINE Messaging API
LINE_CHANNEL_SECRET=your_line_channel_secret
LINE_CHANNEL_ACCESS_TOKEN=your_line_channel_access_token

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**成果物**: `.env.local` ファイル

---

### 1.4 shadcn/ui コンポーネント追加

**所要時間**: 10分

```bash
# 必須コンポーネント一括インストール
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add textarea
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add card
npx shadcn-ui@latest add table
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add form
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add popover
npx shadcn-ui@latest add separator
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add scroll-area
```

**成果物**: `/src/components/ui/` に全UIコンポーネント

---

## 🗄️ Phase 2: Supabase データベース構築 (Week 1-2)

### 2.1 Supabase プロジェクト作成

**所要時間**: 15分

1. https://supabase.com にアクセス
2. 「New Project」をクリック
3. プロジェクト名: `lme-saas`
4. パスワード設定
5. リージョン: `Northeast Asia (Tokyo)`
6. プロジェクト作成完了後、API KeysとProject URLをコピー
7. `.env.local` に貼り付け

**成果物**: Supabaseプロジェクト + API Keys

---

### 2.2 データベーステーブル作成（組織・ユーザー）

**所要時間**: 30分

**ファイル**: Supabase SQL Editor

```sql
-- UUID拡張有効化
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 組織テーブル
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free', -- 'free', 'pro', 'enterprise'
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザーテーブル（Supabase Auth拡張）
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ユーザー・組織紐付け
CREATE TABLE user_organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member', 'readonly'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

-- インデックス
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_user_orgs_user ON user_organizations(user_id);
CREATE INDEX idx_user_orgs_org ON user_organizations(organization_id);

-- RLS有効化
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_organizations ENABLE ROW LEVEL SECURITY;

-- RLSポリシー: 自分の情報のみ閲覧可能
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- RLSポリシー: 所属組織のみ閲覧可能
CREATE POLICY "Users can view organizations they belong to"
ON organizations FOR SELECT
USING (
  id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

**成果物**: 3テーブル作成完了

---

### 2.3 LINE連携テーブル

**所要時間**: 20分

```sql
-- LINEチャネル
CREATE TABLE line_channels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id TEXT UNIQUE NOT NULL,
  channel_secret TEXT NOT NULL,
  channel_access_token TEXT NOT NULL,
  channel_name TEXT,
  bot_basic_id TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- LINE友だち
CREATE TABLE line_friends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES line_channels(id) ON DELETE CASCADE,
  line_user_id TEXT NOT NULL,
  display_name TEXT,
  picture_url TEXT,
  status TEXT DEFAULT 'active', -- 'active', 'blocked', 'unsubscribed'
  language TEXT,
  custom_fields JSONB DEFAULT '{}',
  first_added_at TIMESTAMPTZ DEFAULT NOW(),
  last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(channel_id, line_user_id)
);

-- インデックス
CREATE INDEX idx_line_channels_org ON line_channels(organization_id);
CREATE INDEX idx_line_friends_org ON line_friends(organization_id);
CREATE INDEX idx_line_friends_channel ON line_friends(channel_id);
CREATE INDEX idx_line_friends_user ON line_friends(line_user_id);
CREATE INDEX idx_line_friends_status ON line_friends(status);

-- RLS
ALTER TABLE line_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE line_friends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage channels in their organizations"
ON line_channels FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can view friends in their organizations"
ON line_friends FOR SELECT
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

**成果物**: LINE連携テーブル完成

---

### 2.4 タグ・セグメント管理テーブル

**所要時間**: 25分

```sql
-- タグ
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT DEFAULT '#00B900',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, name)
);

-- 友だちタグ紐付け
CREATE TABLE friend_tags (
  friend_id UUID REFERENCES line_friends(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (friend_id, tag_id)
);

-- セグメント
CREATE TABLE segments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  conditions JSONB NOT NULL, -- 条件定義（JSONクエリ）
  cached_count INTEGER DEFAULT 0,
  last_calculated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tags_org ON tags(organization_id);
CREATE INDEX idx_friend_tags_friend ON friend_tags(friend_id);
CREATE INDEX idx_friend_tags_tag ON friend_tags(tag_id);
CREATE INDEX idx_segments_org ON segments(organization_id);

-- RLS
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE segments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage tags in their organizations"
ON tags FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

**成果物**: タグ・セグメント管理完成

---

### 2.5 メッセージ関連テーブル

**所要時間**: 30分

```sql
-- メッセージ
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  channel_id UUID REFERENCES line_channels(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'text', 'image', 'video', 'flex', 'template'
  content JSONB NOT NULL, -- LINE Message API形式
  status TEXT DEFAULT 'draft', -- 'draft', 'scheduled', 'sending', 'sent', 'failed'
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- メッセージ配信先
CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  friend_id UUID REFERENCES line_friends(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed'
  sent_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_messages_org ON messages(organization_id);
CREATE INDEX idx_messages_status ON messages(status);
CREATE INDEX idx_message_recipients_message ON message_recipients(message_id);
CREATE INDEX idx_message_recipients_friend ON message_recipients(friend_id);
CREATE INDEX idx_message_recipients_status ON message_recipients(status);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage messages in their organizations"
ON messages FOR ALL
USING (
  organization_id IN (
    SELECT organization_id
    FROM user_organizations
    WHERE user_id = auth.uid()
  )
);
```

**成果物**: メッセージ配信基盤完成

---

## 🔐 Phase 3: 認証機能実装 (Week 2)

### 3.1 Supabaseクライアント設定

**所要時間**: 20分

**ファイル**: `/src/lib/supabase/client.ts`

```typescript
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
```

**ファイル**: `/src/lib/supabase/server.ts`

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.delete({ name, ...options })
        },
      },
    }
  )
}
```

**成果物**: Supabaseクライアント設定完了

---

### 3.2 ログインページ作成

**所要時間**: 40分

**ファイル**: `/src/app/login/page.tsx`

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>L Message ログイン</CardTitle>
          <CardDescription>メールアドレスとパスワードを入力してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

**成果物**: ログインページ完成

---

## 🏗️ Phase 4: レイアウト構築 (Week 2-3)

### 4.1 ダッシュボードレイアウト

**所要時間**: 1時間

**ファイル**: `/src/app/dashboard/layout.tsx`

```typescript
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'

export default function DashboardLayout({
  children,
}: {
  children: React.Node
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**ファイル**: `/src/components/dashboard/sidebar.tsx`

```typescript
import Link from 'next/link'
import { Home, MessageSquare, Users, Calendar, BarChart3, Settings } from 'lucide-react'

const navItems = [
  { icon: Home, label: 'ダッシュボード', href: '/dashboard' },
  { icon: MessageSquare, label: 'メッセージ', href: '/dashboard/messages' },
  { icon: Users, label: '友だち', href: '/dashboard/friends' },
  { icon: Calendar, label: '予約', href: '/dashboard/reservations' },
  { icon: BarChart3, label: '分析', href: '/dashboard/analytics' },
  { icon: Settings, label: '設定', href: '/dashboard/settings' },
]

export function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-[#00B900]">L Message</h1>
      </div>
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  )
}
```

**成果物**: ダッシュボードレイアウト完成

---

## 📊 Phase 5: コア機能実装 (Week 3-8)

### 5.1 ダッシュボードページ

**所要時間**: 2時間

**ファイル**: `/src/app/dashboard/page.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MessageSquare, Calendar, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="友だち数"
          value="1,234"
          icon={Users}
          change="+12%"
        />
        <StatsCard
          title="メッセージ配信数"
          value="5,678"
          icon={MessageSquare}
          change="+8%"
        />
        <StatsCard
          title="予約数"
          value="89"
          icon={Calendar}
          change="+23%"
        />
        <StatsCard
          title="開封率"
          value="65%"
          icon={TrendingUp}
          change="+5%"
        />
      </div>
    </div>
  )
}

function StatsCard({ title, value, icon: Icon, change }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-gray-500">前月比 {change}</p>
      </CardContent>
    </Card>
  )
}
```

**成果物**: ダッシュボード完成

---

## 🚀 残りの実装フェーズ

### Phase 6: メッセージ配信機能 (Week 4-5)
- メッセージ作成画面
- ステップ配信設定
- テンプレート管理
- 送信履歴

### Phase 7: 友だち管理機能 (Week 5-6)
- 友だちリスト
- タグ管理
- セグメント作成
- カスタムフィールド

### Phase 8: フォーム機能 (Week 6-7)
- フォームビルダー
- 回答収集
- 自動返信設定

### Phase 9: リッチメニュー (Week 7-8)
- ビジュアルエディタ
- アクション設定
- 表示条件設定

### Phase 10: 予約管理 (Week 8-9)
- スケジュール管理
- 予約受付
- リマインダー

### Phase 11: データ分析 (Week 9-10)
- ダッシュボード
- URL分析
- クロス分析

### Phase 12: テスト・デプロイ (Week 11-12)
- ユニットテスト
- E2Eテスト
- Vercelデプロイ
- 本番環境設定

---

## ✅ 次のステップ

1. **Phase 1を実行**: 環境セットアップ完了
2. **Phase 2を実行**: Supabaseテーブル構築
3. **Phase 3を実行**: 認証機能実装
4. **Phase 4以降**: 順次実装していく

各フェーズの詳細なTODOは、実装を進めながら追加していきます！
