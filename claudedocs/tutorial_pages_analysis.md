# チュートリアル・動画学習ページ 徹底分析レポート

## 目次
1. [概要](#概要)
2. [ページ構造分析](#ページ構造分析)
3. [学習フロー設計](#学習フロー設計)
4. [動画要素の実装](#動画要素の実装)
5. [インタラクティブ要素](#インタラクティブ要素)
6. [デザインシステム](#デザインシステム)
7. [Supabaseテーブル設計](#supabaseテーブル設計)
8. [実装推奨事項](#実装推奨事項)

---

## 概要

### 対象ページ
- **チュートリアルページ**: https://lme.jp/manual/tutorial/
- **動画学習ページ**: https://lme.jp/manual/learn-video/

### ページの役割
- **チュートリアル**: 段階的な学習フローを提供。基礎知識→基本設定→応用設定の3段階構成
- **動画学習**: カテゴリ別に整理された動画ライブラリ。トピック別の自由な学習

---

## ページ構造分析

### 1. チュートリアルページ構造

#### ヘッダー構造
```
- ページタイトル: "チュートリアル"
- 親要素: banner要素でラップ
- レベル: h1
```

#### タブナビゲーション
```javascript
{
  implementation: "強調テキスト（strong要素）をタブとして使用",
  tabs: [
    {
      name: "基礎知識",
      color: "#08BF5A", // アクティブ時: 緑色
      cursor: "default",
      state: "active"
    },
    {
      name: "基本設定",
      color: "#A0A0A0", // 非アクティブ時: グレー
      cursor: "pointer",
      state: "inactive"
    },
    {
      name: "応用設定",
      color: "#A0A0A0",
      cursor: "pointer",
      state: "inactive"
    }
  ],
  interaction: "クリックでタブ切り替え（JavaScript実装）"
}
```

#### コンテンツセクション構造
```
基礎知識セクション
├── H2: "エルメを利用する上で知っておきたいこと"
│   ├── H3: "1. 未認証アカウントご利用の場合の注意点"
│   │   ├── 説明テキスト（複数パラグラフ）
│   │   ├── 動画（Vimeo埋め込み）
│   │   ├── 動画キャプション
│   │   └── 関連マニュアルリンク
│   ├── H3: "2. 既存友だちの追加方法"
│   │   ├── 説明テキスト
│   │   ├── 動画（YouTube埋め込み）
│   │   └── 関連マニュアルリンク
│   ├── H3: "3. 料金プランと配信数のカウント基準"
│   └── H3: "4. エルメのアップグレードと解約"

基本設定セクション
├── H2: "まずは設定しておきたい基本編"
│   ├── H3: "1. あいさつメッセージ"
│   ├── H3: "2. リッチメニュー"
│   ├── H3: "3. ステップ配信"
│   └── H3: "4. 自動応答"

応用設定セクション
└── H2: "マーケティング戦略に活かせる応用編"
    ├── H3: "1. 自走式アンケートメッセージ"
    ├── H3: "2. 診断コンテンツの作成方法"
    └── H3: "3. 流入経路の分析方法"
```

### 2. 動画学習ページ構造

#### カテゴリ別動画一覧
```javascript
{
  totalCategories: 8,
  totalVideos: 13,
  categories: [
    {
      name: "顧客対応",
      videoCount: 2,
      videos: [
        "1:1チャットの使い方",
        "リッチメニュー画像作成機能"
      ]
    },
    {
      name: "メッセージ",
      videoCount: 3,
      videos: [
        "あいさつメッセージとは",
        "テンプレートの使い方",
        "URLに表示期限やアクションを設定する方法"
      ]
    },
    {
      name: "情報管理",
      videoCount: 1
    },
    {
      name: "データ分析",
      videoCount: 1
    },
    {
      name: "販促ツール",
      videoCount: 1
    },
    {
      name: "予約管理",
      videoCount: 2
    },
    {
      name: "その他システム関連",
      videoCount: 2
    },
    {
      name: "有料プラン限定",
      videoCount: 1
    }
  ]
}
```

#### ページレイアウト
```
動画学習ページ
├── ページヘッダー: "動画で学ぶ"
├── カテゴリナビゲーション（横スクロール可能）
│   ├── 顧客対応
│   ├── メッセージ
│   ├── 情報管理
│   ├── データ分析
│   ├── 販促ツール
│   ├── 予約管理
│   ├── その他システム関連
│   └── 有料プラン限定
└── コンテンツエリア
    └── 各カテゴリセクション
        ├── H2: カテゴリ名
        └── 動画カード（グリッドレイアウト）
            ├── 動画埋め込み（iframe）
            └── 動画タイトル（figcaption）
```

---

## 学習フロー設計

### チュートリアルの学習フロー

#### 段階的学習パス
```
Step 1: 基礎知識（必須）
├── 未認証アカウントの注意点を理解
├── 既存友だちの追加方法を学習
├── 料金プランを確認
└── アップグレード・解約方法を把握

Step 2: 基本設定（推奨）
├── あいさつメッセージを設定
├── リッチメニューを作成
├── ステップ配信を理解
└── 自動応答を設定

Step 3: 応用設定（オプション）
├── アンケート機能を活用
├── 診断コンテンツを作成
└── 流入経路分析を実施
```

#### 学習進捗管理の推奨実装
```javascript
// 現状: 進捗管理なし
// 推奨: 以下の機能を追加

interface LearningProgress {
  userId: string;
  currentTab: 'basic' | 'intermediate' | 'advanced';
  completedLessons: string[]; // レッスンID配列
  lastAccessedAt: Date;
  progressPercentage: number;
}

// タブごとの進捗率を計算
function calculateTabProgress(tab: string): number {
  const lessonsInTab = getLessonsForTab(tab);
  const completedCount = getCompletedLessons(tab).length;
  return (completedCount / lessonsInTab.length) * 100;
}
```

### 動画学習の学習フロー

#### 自由形式の学習パス
```
カテゴリベースの学習
├── ユーザーは興味のあるカテゴリを選択
├── カテゴリ内の動画を順不同で視聴
├── 関連カテゴリへの推奨動線なし（改善の余地あり）
└── 視聴履歴や進捗の追跡なし（実装推奨）
```

---

## 動画要素の実装

### 1. 動画プラットフォーム

#### 使用プラットフォーム
- **YouTube**: 主要プラットフォーム（約90%の動画）
- **Vimeo**: 一部の動画（チュートリアルページで使用）

#### 埋め込み形式

**YouTube埋め込み**
```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID?feature=oembed&enablejsapi=1&origin=https://lme.jp"
  width="1256"
  height="707"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
  title="動画タイトル"
></iframe>
```

**Vimeo埋め込み**
```html
<iframe
  src="https://player.vimeo.com/video/VIDEO_ID?h=HASH&dnt=1&app_id=122963"
  frameborder="0"
  allow="autoplay; fullscreen; picture-in-picture"
  allowfullscreen
  title="動画タイトル"
></iframe>
```

### 2. 動画プレイヤーのUI要素

#### YouTube プレイヤー機能
```javascript
{
  controls: {
    playPause: true,
    progressBar: true,
    volume: true,
    settings: {
      quality: "自動/144p～1080p",
      playbackSpeed: "0.25x～2x",
      captions: "字幕オン/オフ"
    },
    pictureInPicture: true,
    fullscreen: true,
    transcript: false // YouTubeには標準搭載なし
  },

  accessibility: {
    keyboardShortcuts: true,
    screenReaderSupport: true,
    captionSupport: true
  },

  userInteraction: {
    channelLink: "LINEで自動化するならエルメッセージ",
    moreInfo: "さらに表示ボタン",
    relatedVideos: false // 埋め込みでは非表示
  }
}
```

#### Vimeo プレイヤー機能
```javascript
{
  controls: {
    playPause: true,
    progressBar: true,
    volume: true,
    settings: {
      quality: "自動/360p～1080p",
      playbackSpeed: "0.5x～2x",
      captions: "CC/字幕"
    },
    pictureInPicture: true,
    fullscreen: true,
    transcript: true, // Vimeo Pro機能
    hideControls: "自動的に隠れる"
  },

  branding: {
    vimeoLogo: "コントロールバーに表示",
    videoTitle: "上部に表示",
    byline: "作成者情報表示可能"
  },

  dnt: true // Do Not Track有効
}
```

### 3. 動画コンテナのレイアウト

#### レスポンシブ対応
```css
.video-container {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; /* 16:9 アスペクト比 */
  height: 0;
  overflow: hidden;
}

.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
```

#### 実装されているレイアウト
```javascript
{
  containerClass: "eye-catch",
  styling: {
    margin: "0 0 9.6px",
    padding: "0",
    width: "auto",
    display: "block"
  },
  aspectRatio: {
    width: 1256,
    height: 707,
    ratio: 1.776 // ≈ 16:9
  }
}
```

### 4. 動画関連のメタデータ

#### 各動画に含まれる情報
```typescript
interface VideoMetadata {
  platform: 'YouTube' | 'Vimeo';
  embedUrl: string;
  directLink?: string; // 元の動画ページへのリンク
  title: string;
  caption: string; // 日本語の説明文
  thumbnail?: string;
  duration?: string; // 現在は未取得
  publishedAt?: Date; // 現在は未取得
  category: string; // 所属カテゴリ
  relatedManualLink?: string; // 関連マニュアルページ
}
```

---

## インタラクティブ要素

### 1. 現在実装されている要素

#### タブナビゲーション（チュートリアル）
```javascript
{
  element: "strong要素をボタンとして使用",
  interaction: "クリックでコンテンツ切り替え",
  visualFeedback: {
    active: {
      color: "#08BF5A", // 緑色
      cursor: "default"
    },
    inactive: {
      color: "#A0A0A0", // グレー
      cursor: "pointer"
    }
  },
  implementation: "JavaScriptによる動的クラス付与"
}
```

#### カテゴリナビゲーション（動画学習）
```javascript
{
  element: "リンク要素",
  layout: "横並び（flexbox）",
  interaction: "ページ内アンカーリンク",
  scrollBehavior: "smooth" // ブラウザのネイティブ機能
}
```

#### 関連マニュアルリンク
```javascript
{
  text: "関連マニュアルを確認",
  styling: {
    display: "inline-block",
    color: "#08BF5A",
    textDecoration: "none",
    border: "1px solid",
    padding: "適度な余白",
    borderRadius: "角丸"
  },
  hover: {
    backgroundColor: "#08BF5A",
    color: "#FFFFFF"
  }
}
```

### 2. 推奨追加要素

#### 学習進捗インジケーター
```typescript
interface ProgressIndicator {
  type: 'circular' | 'linear';
  value: number; // 0-100
  label: string;
  sections?: {
    name: string;
    completed: boolean;
    total: number;
    current: number;
  }[];
}

// 実装例
<div class="progress-indicator">
  <div class="progress-circle">
    <svg viewBox="0 0 100 100">
      <circle class="progress-bg" cx="50" cy="50" r="45" />
      <circle
        class="progress-fill"
        cx="50"
        cy="50"
        r="45"
        stroke-dasharray="282.7"
        stroke-dashoffset="calc(282.7 - (282.7 * {progress} / 100))"
      />
    </svg>
    <div class="progress-text">{progress}%</div>
  </div>
  <p>基礎知識: 4/4完了</p>
</div>
```

#### チェックリスト機能
```typescript
interface ChecklistItem {
  id: string;
  lessonId: string;
  text: string;
  completed: boolean;
  optional: boolean;
}

// UI実装
<div class="checklist">
  <label class="checklist-item">
    <input
      type="checkbox"
      checked={item.completed}
      onChange={() => updateProgress(item.id)}
    />
    <span class="checkmark"></span>
    <span class="lesson-title">{item.text}</span>
    {item.optional && <span class="badge">オプション</span>}
  </label>
</div>
```

#### 動画視聴完了トラッキング
```typescript
interface VideoWatchProgress {
  videoId: string;
  userId: string;
  watchedSeconds: number;
  totalSeconds: number;
  completed: boolean; // 90%以上視聴で完了
  lastWatchedAt: Date;
}

// YouTube IFrame API を使用した実装
const player = new YT.Player('video-player', {
  events: {
    'onStateChange': onPlayerStateChange,
    'onProgress': updateWatchProgress
  }
});

function updateWatchProgress() {
  const currentTime = player.getCurrentTime();
  const duration = player.getDuration();
  const progress = (currentTime / duration) * 100;

  if (progress >= 90 && !videoCompleted) {
    markVideoAsCompleted(videoId);
  }
}
```

#### 次のステップ推奨
```typescript
interface NextStepRecommendation {
  currentLesson: string;
  nextLesson: string;
  reason: string;
  priority: 'high' | 'medium' | 'low';
}

// UI実装
<div class="next-step-card">
  <h3>次のステップ</h3>
  <div class="recommendation">
    <div class="lesson-preview">
      <img src={nextLesson.thumbnail} alt="" />
      <span class="duration">{nextLesson.duration}</span>
    </div>
    <div class="lesson-info">
      <h4>{nextLesson.title}</h4>
      <p>{nextLesson.description}</p>
      <button class="btn-primary">学習を続ける</button>
    </div>
  </div>
</div>
```

---

## デザインシステム

### 1. カラーパレット

```javascript
{
  primary: {
    main: "#08BF5A", // メインの緑色（ボタン、アクティブタブ）
    light: "#5EDAD9", // 明るい緑（ホバー効果用）
    dark: "#07C43B"   // 濃い緑（フォーカス時）
  },

  secondary: {
    main: "#A0A0A0", // グレー（非アクティブ要素）
    light: "#E0E0E0",
    dark: "#606060"
  },

  background: {
    primary: "#FFFFFF", // メイン背景
    secondary: "#F9F9F9", // セクション背景
    tertiary: "#F5F5F5"  // カード背景
  },

  text: {
    primary: "#333333",   // メインテキスト
    secondary: "#666666", // サブテキスト
    tertiary: "#999999",  // キャプション
    inverse: "#FFFFFF"    // 反転テキスト
  },

  border: {
    light: "rgba(45, 45, 45, 0.07)",
    medium: "rgba(45, 45, 45, 0.15)",
    dark: "rgba(45, 45, 45, 0.3)"
  },

  status: {
    success: "#08BF5A",
    warning: "#FFA500",
    error: "#FF4444",
    info: "#2196F3"
  }
}
```

### 2. タイポグラフィ

```css
/* 見出しスタイル */
h1 {
  font-size: 2rem;      /* 32px */
  font-weight: 700;
  line-height: 1.3;
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.5rem;    /* 24px */
  font-weight: 600;
  line-height: 1.4;
  margin-bottom: 1.25rem;
  margin-top: 2.5rem;
}

h3 {
  font-size: 1.25rem;   /* 20px */
  font-weight: 600;
  line-height: 1.5;
  margin-bottom: 1rem;
  margin-top: 2rem;
}

/* 本文スタイル */
p {
  font-size: 1rem;      /* 16px */
  line-height: 1.8;
  margin-bottom: 1rem;
  color: #333333;
}

/* キャプションスタイル */
figcaption {
  font-size: 0.875rem;  /* 14px */
  color: #666666;
  text-align: center;
  margin-top: 0.5rem;
}
```

### 3. スペーシングシステム

```javascript
{
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px"
  },

  sectionSpacing: {
    betweenSections: "48px",
    betweenLessons: "32px",
    betweenElements: "16px"
  },

  containerPadding: {
    mobile: "16px",
    tablet: "24px",
    desktop: "32px"
  }
}
```

### 4. コンポーネントスタイル

#### タブボタン
```css
.tab-button {
  display: inline-block;
  padding: 12px 24px;
  margin-right: 16px;
  font-size: 1rem;
  font-weight: 600;
  color: #A0A0A0;
  background-color: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-button:hover {
  color: #08BF5A;
}

.tab-button.active {
  color: #08BF5A;
  border-bottom-color: #08BF5A;
  cursor: default;
}
```

#### 動画カード
```css
.video-card {
  background: #FFFFFF;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.video-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.video-card-header {
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  background: #000;
}

.video-card-body {
  padding: 16px;
}

.video-card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
```

#### リンクボタン
```css
.manual-link {
  display: inline-block;
  padding: 10px 20px;
  font-size: 0.875rem;
  color: #08BF5A;
  background-color: transparent;
  border: 2px solid #08BF5A;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.manual-link:hover {
  color: #FFFFFF;
  background-color: #08BF5A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(8, 191, 90, 0.2);
}
```

### 5. レスポンシブブレークポイント

```javascript
{
  breakpoints: {
    mobile: "0-767px",
    tablet: "768-1023px",
    desktop: "1024px+"
  },

  containerWidth: {
    mobile: "100%",
    tablet: "720px",
    desktop: "1140px"
  },

  gridColumns: {
    mobile: 1,
    tablet: 2,
    desktop: 3
  }
}
```

---

## Supabaseテーブル設計

### 1. テーブル構造

#### tutorials テーブル
```sql
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tab_category TEXT NOT NULL, -- 'basic' | 'intermediate' | 'advanced'
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tutorials_tab_category ON tutorials(tab_category);
CREATE INDEX idx_tutorials_order_index ON tutorials(order_index);
```

#### lessons テーブル
```sql
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tutorial_id UUID REFERENCES tutorials(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  estimated_duration INTEGER, -- 推定学習時間（分）
  is_optional BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_lessons_tutorial_id ON lessons(tutorial_id);
CREATE INDEX idx_lessons_order_index ON lessons(order_index);
```

#### lesson_content テーブル
```sql
CREATE TABLE lesson_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL, -- 'text' | 'video' | 'link' | 'image'
  order_index INTEGER NOT NULL,

  -- テキストコンテンツ
  text_content TEXT,

  -- 動画コンテンツ
  video_platform TEXT, -- 'youtube' | 'vimeo'
  video_id TEXT,
  video_embed_url TEXT,
  video_direct_url TEXT,
  video_title TEXT,
  video_duration INTEGER, -- 秒数

  -- リンクコンテンツ
  link_url TEXT,
  link_text TEXT,
  link_type TEXT, -- 'manual' | 'external'

  -- 画像コンテンツ
  image_url TEXT,
  image_alt TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_lesson_content_lesson_id ON lesson_content(lesson_id);
CREATE INDEX idx_lesson_content_order_index ON lesson_content(order_index);
```

#### video_categories テーブル
```sql
CREATE TABLE video_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT, -- アイコン名またはURL
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_video_categories_order_index ON video_categories(order_index);
```

#### videos テーブル
```sql
CREATE TABLE videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES video_categories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  caption TEXT,
  description TEXT,

  platform TEXT NOT NULL, -- 'youtube' | 'vimeo'
  video_id TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  direct_url TEXT,
  thumbnail_url TEXT,
  duration INTEGER, -- 秒数

  order_index INTEGER,
  view_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_videos_category_id ON videos(category_id);
CREATE INDEX idx_videos_order_index ON videos(order_index);
CREATE INDEX idx_videos_platform ON videos(platform);
```

#### user_progress テーブル
```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- auth.users(id)への参照
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,

  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- インデックス
CREATE INDEX idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson_id ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
```

#### video_watch_progress テーブル
```sql
CREATE TABLE video_watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,

  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,

  first_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_watched_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(user_id, video_id)
);

-- インデックス
CREATE INDEX idx_video_watch_progress_user_id ON video_watch_progress(user_id);
CREATE INDEX idx_video_watch_progress_video_id ON video_watch_progress(video_id);
CREATE INDEX idx_video_watch_progress_completed ON video_watch_progress(completed);
```

#### learning_paths テーブル（推奨学習パス）
```sql
CREATE TABLE learning_paths (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  difficulty TEXT, -- 'beginner' | 'intermediate' | 'advanced'
  estimated_hours INTEGER, -- 推定学習時間
  order_index INTEGER,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### learning_path_items テーブル
```sql
CREATE TABLE learning_path_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL, -- 'lesson' | 'video'
  item_id UUID NOT NULL, -- lessons.id または videos.id
  order_index INTEGER NOT NULL,
  is_required BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_learning_path_items_path_id ON learning_path_items(learning_path_id);
CREATE INDEX idx_learning_path_items_order_index ON learning_path_items(order_index);
```

### 2. RLS (Row Level Security) ポリシー

```sql
-- user_progress テーブルのRLS
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON user_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON user_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON user_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- video_watch_progress テーブルのRLS
ALTER TABLE video_watch_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own watch progress"
  ON video_watch_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own watch progress"
  ON video_watch_progress FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own watch progress"
  ON video_watch_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 公開コンテンツは全員が閲覧可能
CREATE POLICY "Anyone can view published tutorials"
  ON tutorials FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view published lessons"
  ON lessons FOR SELECT
  USING (is_published = true);

CREATE POLICY "Anyone can view published videos"
  ON videos FOR SELECT
  USING (is_published = true);
```

### 3. ビューの作成

#### tutorial_with_progress ビュー
```sql
CREATE VIEW tutorial_with_progress AS
SELECT
  t.*,
  COUNT(l.id) as total_lessons,
  COUNT(CASE WHEN up.status = 'completed' THEN 1 END) as completed_lessons,
  ROUND(
    COUNT(CASE WHEN up.status = 'completed' THEN 1 END)::NUMERIC /
    NULLIF(COUNT(l.id), 0) * 100
  ) as completion_percentage
FROM tutorials t
LEFT JOIN lessons l ON l.tutorial_id = t.id
LEFT JOIN user_progress up ON up.lesson_id = l.id AND up.user_id = auth.uid()
WHERE t.is_published = true
GROUP BY t.id;
```

#### video_category_stats ビュー
```sql
CREATE VIEW video_category_stats AS
SELECT
  vc.*,
  COUNT(v.id) as video_count,
  SUM(v.duration) as total_duration,
  COUNT(vwp.id) as watched_videos,
  COUNT(CASE WHEN vwp.completed THEN 1 END) as completed_videos
FROM video_categories vc
LEFT JOIN videos v ON v.category_id = vc.id AND v.is_published = true
LEFT JOIN video_watch_progress vwp ON vwp.video_id = v.id AND vwp.user_id = auth.uid()
WHERE vc.is_published = true
GROUP BY vc.id;
```

### 4. データ投入例

#### チュートリアルデータ
```sql
-- 基礎知識チュートリアル
INSERT INTO tutorials (slug, title, description, tab_category, order_index) VALUES
('basic-knowledge', 'エルメを利用する上で知っておきたいこと', '基本的な知識と注意事項', 'basic', 1);

-- レッスン
INSERT INTO lessons (tutorial_id, slug, title, description, order_index, estimated_duration) VALUES
(
  (SELECT id FROM tutorials WHERE slug = 'basic-knowledge'),
  'unverified-account-notes',
  '未認証アカウントご利用の場合の注意点',
  '未認証アカウントでエルメを使用する際の注意点を学びます',
  1,
  5
);

-- レッスンコンテンツ（テキスト）
INSERT INTO lesson_content (lesson_id, content_type, order_index, text_content) VALUES
(
  (SELECT id FROM lessons WHERE slug = 'unverified-account-notes'),
  'text',
  1,
  '未認証アカウントをご利用ですでにLINE公式アカウントに友だちが登録されている場合、すぐにはエルメを利用したメッセージ配信をすることはできません。'
);

-- レッスンコンテンツ（動画）
INSERT INTO lesson_content (
  lesson_id,
  content_type,
  order_index,
  video_platform,
  video_id,
  video_embed_url,
  video_title,
  video_duration
) VALUES
(
  (SELECT id FROM lessons WHERE slug = 'unverified-account-notes'),
  'video',
  2,
  'vimeo',
  '1012371326',
  'https://player.vimeo.com/video/1012371326?h=b6037f4541',
  '未認証アカウント接続時の注意点',
  233
);
```

#### 動画学習データ
```sql
-- カテゴリ
INSERT INTO video_categories (slug, name, description, order_index) VALUES
('customer-service', '顧客対応', 'チャットやリッチメニューの使い方', 1),
('messaging', 'メッセージ', 'メッセージ配信機能の活用方法', 2),
('info-management', '情報管理', 'タグや友だち情報の管理方法', 3);

-- 動画
INSERT INTO videos (
  category_id,
  slug,
  title,
  caption,
  platform,
  video_id,
  embed_url,
  duration,
  order_index
) VALUES
(
  (SELECT id FROM video_categories WHERE slug = 'customer-service'),
  '1on1-chat-tutorial',
  'L Message（エルメ）の1:1チャットの使い方',
  '1:1チャットの使い方',
  'youtube',
  'RpbpwBMmZWs',
  'https://www.youtube.com/embed/RpbpwBMmZWs?feature=oembed',
  480,
  1
);
```

---

## 実装推奨事項

### 1. 優先度: 高

#### 学習進捗トラッキング
```typescript
// 実装すべき機能
- レッスン完了ステータスの保存
- 動画視聴進捗の記録
- チュートリアル全体の進捗率表示
- 「学習を続ける」機能（前回の続きから開始）
```

#### レスポンシブデザインの最適化
```typescript
// モバイルファーストアプローチ
- 動画の適切なアスペクト比維持
- タブナビゲーションのスワイプ対応
- カテゴリナビゲーションの横スクロール
- タッチフレンドリーなUIサイズ
```

#### アクセシビリティ改善
```typescript
// WCAG 2.1 AA準拠
- 適切なaria-label、role属性の設定
- キーボードナビゲーション対応
- スクリーンリーダー対応
- 十分なカラーコントラスト比
- 動画への字幕提供
```

### 2. 優先度: 中

#### インタラクティブ要素の追加
```typescript
- チェックリスト機能
- クイズ/理解度チェック
- ブックマーク機能
- メモ機能
- 学習時間の記録
```

#### 学習体験の向上
```typescript
- 次のステップ推奨機能
- 関連コンテンツの提案
- 学習パスの提案
- バッジ/達成度システム
- 学習統計ダッシュボード
```

#### 動画機能の拡張
```typescript
- 動画内チャプター機能
- 再生速度の記憶
- 前回の続きから再生
- 動画のダウンロード（オフライン視聴）
- 字幕/トランスクリプトの表示
```

### 3. 優先度: 低

#### ソーシャル機能
```typescript
- コメント機能
- レビュー/評価システム
- 学習内容のシェア
- 質問フォーラム
```

#### 高度な分析機能
```typescript
- 学習パターンの分析
- 離脱ポイントの特定
- A/Bテスト機能
- パーソナライズされた推奨
```

### 4. 技術スタック推奨

#### フロントエンド
```typescript
{
  framework: "Next.js 14+ (App Router)",
  language: "TypeScript",
  styling: "Tailwind CSS + shadcn/ui",
  stateManagement: "Zustand または Jotai",
  videoPlayer: {
    youtube: "react-youtube",
    vimeo: "@u-wave/react-vimeo",
    custom: "video.js"
  },
  animation: "Framer Motion"
}
```

#### バックエンド
```typescript
{
  database: "Supabase (PostgreSQL)",
  auth: "Supabase Auth",
  storage: "Supabase Storage（動画サムネイル等）",
  realtime: "Supabase Realtime（進捗同期）",
  functions: "Supabase Edge Functions（分析処理等）"
}
```

#### その他
```typescript
{
  analytics: "Google Analytics 4 + Plausible",
  monitoring: "Sentry",
  cdnVideo: "YouTube/Vimeo（現状維持）",
  search: "Algolia または Meilisearch"
}
```

---

## まとめ

### 主要な発見事項

1. **段階的学習設計**: チュートリアルは基礎→基本→応用の3段階構成で、初心者から上級者まで対応
2. **カテゴリベース構造**: 動画学習は8カテゴリに整理され、トピック別の自由な学習が可能
3. **マルチプラットフォーム**: YouTube（主要）とVimeo（一部）の2プラットフォームを使用
4. **進捗管理の欠如**: 現状、ユーザーの学習進捗やビデオ視聴履歴の追跡機能なし
5. **シンプルなUI**: インタラクティブ要素は最小限だが、視認性が高くわかりやすいデザイン

### 実装時の重要ポイント

1. **進捗トラッキングは必須**: ユーザーが学習を継続しやすくするため
2. **レスポンシブ対応を優先**: モバイルでの学習体験が重要
3. **アクセシビリティを確保**: すべてのユーザーが学習できる環境を
4. **パフォーマンス最適化**: 動画の遅延読み込み、効率的なデータ取得
5. **スケーラブルな設計**: コンテンツが増えても対応できる柔軟な構造

### 次のステップ

1. Supabaseプロジェクトのセットアップとテーブル作成
2. Next.js プロジェクトの初期設定とルーティング設計
3. 動画プレイヤーコンポーネントの実装とテスト
4. 進捗管理システムの実装
5. レスポンシブデザインの実装とテスト
6. アクセシビリティ監査と改善
7. パフォーマンス最適化と本番デプロイ

---

**分析日**: 2025-10-29
**分析対象**: チュートリアルページ + 動画学習ページ（計2ページ）
**総動画数**: チュートリアル 12本、動画学習 13本（重複あり）
