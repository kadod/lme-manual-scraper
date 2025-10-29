# L Message マニュアルサイト 完全コピー - 統合要件定義書

**作成日**: 2025-10-29
**対象サイト**: https://lme.jp/manual/
**総ページ数**: 193ページ
**技術スタック**: Next.js 14+ (App Router) + Supabase + Vercel + TailwindCSS

---

## 目次

1. [プロジェクト概要](#1-プロジェクト概要)
2. [機能要件](#2-機能要件)
3. [非機能要件](#3-非機能要件)
4. [データベース設計](#4-データベース設計)
5. [UI/UXデザイン要件](#5-uiuxデザイン要件)
6. [実装計画](#6-実装計画)
7. [データ移行計画](#7-データ移行計画)
8. [TODOリスト](#8-todoリスト)
9. [技術的制約と前提条件](#9-技術的制約と前提条件)
10. [リスク管理](#10-リスク管理)

---

## 1. プロジェクト概要

### 1.1 目的と背景

L Message（エルメッセージ）の使い方マニュアルサイト（https://lme.jp/manual/）の完全なコピーを、モダンな技術スタックで構築する。元サイトの構造、デザイン、機能を忠実に再現しつつ、パフォーマンスと保守性を向上させる。

### 1.2 対象サイトの構成

**総ページ数**: 193ページ

**内訳**:
- トップページ: 1ページ
- カテゴリページ: 50ページ
- 記事・マニュアルページ: 122ページ
- 導入事例: 12ページ
- お知らせ: 5ページ
- チュートリアル: 1ページ
- 動画学習: 1ページ
- お問い合わせ: 1ページ

**カテゴリ構成** (9大カテゴリ):
1. 顧客対応 (6サブカテゴリ)
2. メッセージ (5サブカテゴリ)
3. 情報管理 (4サブカテゴリ)
4. データ分析 (4サブカテゴリ)
5. 販促ツール (2サブカテゴリ)
6. 予約管理 (5サブカテゴリ)
7. システム設定・契約 (3サブカテゴリ)
8. その他システム関連 (2サブカテゴリ)
9. 有料プラン限定 (4サブカテゴリ)

### 1.3 技術スタック

**フロントエンド**:
- Next.js 14.2+ (App Router必須)
- TypeScript 5.3+
- React 18+
- TailwindCSS 3.4+
- shadcn/ui (UIコンポーネント)
- Framer Motion (アニメーション)

**バックエンド**:
- Supabase (PostgreSQL 15+)
- Supabase Auth (認証)
- Supabase Storage (画像・動画)
- Supabase Realtime (リアルタイム機能)

**デプロイ・インフラ**:
- Vercel (ホスティング)
- Vercel Edge Functions (サーバーレス関数)
- Vercel Analytics (分析)

**開発ツール**:
- ESLint + Prettier (コード品質)
- Husky + lint-staged (pre-commit hooks)
- Playwright (E2Eテスト)

### 1.4 完全コピーの定義と成功基準

**完全コピーの定義**:
1. **視覚的一致度**: 95%以上（デザイン、レイアウト、色彩）
2. **機能的一致度**: 100%（全機能の再現）
3. **コンテンツ完全性**: 193ページすべてを移行
4. **レスポンシブ対応**: デスクトップ/タブレット/モバイルで完全動作
5. **パフォーマンス**: Lighthouse Score 90以上

**成功基準**:
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- アクセシビリティ: WCAG 2.1 AA準拠
- SEO: 構造化データ完備、全ページインデックス可能
- セキュリティ: HTTPS、XSS対策、RLS設定完了

---

## 2. 機能要件

### 2.1 ページタイプ別機能

#### 2.1.1 トップページ (`/manual/`)

**ヒーローセクション**:
- ページ内アンカーリンク (5つ: カテゴリ/学習/お困り/お知らせ/導入事例)
- スムーズスクロール機能

**カテゴリセクション** (最重要):
- 9つのカテゴリカード（3列×3行グリッド）
- 各カード:
  - アイコン画像
  - カテゴリ名（H3）
  - 説明文
  - サブカテゴリリスト（5-6個）
  - 「カテゴリーについて見る」リンク
- ホバーエフェクト（シャドウ + 上昇）
- レスポンシブ: デスクトップ 3列 → タブレット 2列 → モバイル 1列

**学習セクション**:
- 2カラムレイアウト（画像 + テキスト）
- 2つのCTA: 「チュートリアルを見る」「動画で学ぶ」

**ヘルプセクション**:
- 2つのカード: 「よくある質問」「お問い合わせ」
- 外部リンク対応

**お知らせセクション**:
- 最新3件を表示（タイムライン形式）
- 各項目: 日付 + カテゴリタグ + タイトル
- 「お知らせ一覧」リンク

**導入事例セクション** (カルーセル):
- 10件の導入事例カード
- 左右ナビゲーションボタン
- 自動再生オプション
- レスポンシブ表示枚数（デスクトップ 3枚 → タブレット 2枚 → モバイル 1枚）
- 「導入事例一覧」リンク

#### 2.1.2 カテゴリページ (`/manual/category/[slug]/`) - 50ページ

**ページ構成**:
- パンくずリスト（ホーム > カテゴリ名）
- ページタイトル（H1: カテゴリ名）
- カテゴリ説明文
- セクション表示（1-7セクション、平均1.4セクション）
  - セクションアイコン（44/50ページで使用）
  - セクションタイトル（H2）
  - 記事カードグリッド

**サイドバー**:
- 右サイドバー（デスクトップ）
- カテゴリツリーナビゲーション
- 関連カテゴリ（一部ページ）

**記事カード**:
- タイトル
- 抜粋文
- サムネイル画像（オプション）
- カテゴリバッジ

**ページネーション**:
- 1ページあたり最大20記事
- 数値ページング + 前後ボタン

#### 2.1.3 記事・マニュアルページ (`/manual/[slug]/`) - 122ページ

**4つのページタイプ**:

**A. チュートリアル型**:
- ヒーローイメージ（バナー）
- ステップバイステップ構成
- YouTube/Vimeo動画埋め込み
- スクリーンショット多用
- 関連マニュアルリンク

**B. FAQ型**:
- 質問リスト（緑左ボーダー付きボックス）
- アコーディオン構造（Q&A折りたたみ）
- エラーメッセージ確認事項
- 関連リンク多数

**C. 機能説明型**:
- 概要セクション（機能の目的・利点）
- 設定手順（詳細フロー）
- 活用例（ユースケース）
- 関連機能リンク
- 動画解説

**D. トラブルシューティング型**:
- 問題の明確化
- 原因リスト
- 解決手順（チェックリスト）
- サポート誘導

**共通要素**:
- パンくずリスト（ホーム > カテゴリ > サブカテゴリ > 記事）
- H1タイトル
- 目次（TOC）- 右サイドバーに固定、H2/H3から自動生成
  - スムーズスクロール
  - アクティブセクションハイライト
  - 折りたたみ可能
  - モバイル: コンテンツ直下に移動
- メインコンテンツ:
  - 見出し構造（H1 > H2 > H3）
  - 段落テキスト
  - 箇条書きリスト（番号付き/記号付き）
  - 画像（Lightbox対応）
  - 動画埋め込み（YouTube/Vimeo）
  - コードブロック
  - 引用・注意書きボックス
- 関連記事リンク（ページ下部）
- CTA（マニュアル作成依頼、お問い合わせ）
- カテゴリータグ

**インタラクティブ要素**:
- スムーススクロール（目次リンク）
- アコーディオン（FAQ）
- Lightbox（画像拡大）
- 動画プレイヤー（YouTube/Vimeo）
- アンカーリンク（見出しにホバーで表示）

#### 2.1.4 導入事例ページ (`/manual/interview-[slug]/`) - 12ページ

**ページ構造**:
- パンくずリスト
- ページタイトル（H1: 企業名 + 導入事例インタビュー）

**ヒーローセクション**:
- キービジュアル（企業イメージ写真）
- キャッチコピー（2行、太字）
- 企業プロフィールボックス:
  - 企業ロゴ/アイコン
  - 企業名
  - 業種・所在地
  - 特徴・実績
  - ウェブサイトURL

**3つの箱（課題・施策・成果）**:
- 横並び3カラム
- 各カラム:
  - 見出し（導入前の課題 / 施策 / エルメで解決）
  - 箇条書き（3-5項目）
  - 重要語句は `<mark>` でハイライト

**インタビュー本文**:
- H2セクション構成:
  1. L Message導入前の課題
  2. L Message導入の経緯
  3. L Messageの主な活用事例
  4. L Message導入の成果
  5. L Messageのおすすめポイント

**担当代理店紹介**:
- プロフィール写真（正方形）
- 代表者名 + 会社名
- 活動内容・経歴
- CHECKボックス（代理店インタビューへのリンク）

**吹き出し（引用）**:
- 左側: アバター画像 + ラベル（クライアント/代理店）
- 右側: 吹き出し背景 + 本文

**データテーブル**:
- 比較表（導入前/導入後/導入効果）
- 指標例: CPA, ROAS, CVR, リスト獲得数, 工数削減
- ゼブラストライプ
- 改善率は太字+色付き

**CTA**:
- LINE公式アカウント友だち追加
- 認定講座紹介

#### 2.1.5 お知らせページ (`/manual/[update-slug]/`) - 5ページ

**ページ構成**:
- アイキャッチ画像（全幅）
- タイトル（H1）
- 公開日

**導入セクション**:
- メンテナンス告知
- 注意事項（箇条書き）

**目次**:
- 折りたたみ可能
- H2/H4セクションから自動生成

**コンテンツセクション**:
- H2: 大項目（例: クロス分析のアップデート）
- H4: 小項目（例: 操作画面リニューアル）
- 画像: 拡大可能（モーダル表示）
- 本文: 段落テキスト

**カテゴリータグ**:
- 「お知らせ」「アップデート情報」

#### 2.1.6 チュートリアルページ (`/manual/tutorial/`) - 1ページ

**タブナビゲーション**:
- 3つのタブ: 基礎知識 / 基本設定 / 応用設定
- クリックでコンテンツ切り替え
- アクティブタブ: 緑色（#08BF5A）、カーソル: default
- 非アクティブタブ: グレー（#A0A0A0）、カーソル: pointer

**コンテンツ構造** (各タブ):
- H2: タブタイトル
- H3: レッスンタイトル（番号付き: 1, 2, 3, 4）
- 説明テキスト（複数段落）
- 動画埋め込み（Vimeo/YouTube）
- 動画キャプション
- 関連マニュアルリンク

**レッスン数**:
- 基礎知識: 4レッスン
- 基本設定: 4レッスン
- 応用設定: 3レッスン

#### 2.1.7 動画学習ページ (`/manual/learn-video/`) - 1ページ

**カテゴリナビゲーション**:
- 横スクロール可能（8カテゴリ）
- ページ内アンカーリンク
- スムーススクロール

**動画カテゴリ** (8カテゴリ、計13動画):
1. 顧客対応 (2動画)
2. メッセージ (3動画)
3. 情報管理 (1動画)
4. データ分析 (1動画)
5. 販促ツール (1動画)
6. 予約管理 (2動画)
7. その他システム関連 (2動画)
8. 有料プラン限定 (1動画)

**動画カード**:
- 動画埋め込み（iframe: YouTube/Vimeo）
- 動画タイトル（figcaption）
- レスポンシブ: 16:9アスペクト比維持
- グリッドレイアウト: デスクトップ 3列 → タブレット 2列 → モバイル 1列

#### 2.1.8 お問い合わせページ (`/manual/contact/`) - 1ページ

**5つのセクション**:

1. **L Messageシステム全般のサポート**:
   - 説明文
   - 2つのボタン: LINEサポート / チャットサポート
   - 注意書き（無料サポート範囲）
   - マニュアル作成依頼リンク

2. **LINE公式アカウントのサポート**:
   - 外部リンク（LINEヤフー株式会社）
   - セカンダリボタン

3. **最新情報・ノウハウ配信**:
   - LINE公式アカウント友だち追加
   - エルメサロン（チャットワーク）参加

4. **各種有料サービス**:
   - 制作・運用代行
   - 販売代理店

5. **その他お問い合わせ**:
   - 各種窓口への誘導

**デザイン**:
- セクションごとに明確に区分
- CTAボタンの視認性重視
- 注意事項は※で強調

### 2.2 共通機能（全ページ）

#### 2.2.1 ヘッダー

**デスクトップヘッダー**:
- ロゴ（左上）: クリックでトップページへ
- グローバルナビゲーション（右側）:
  1. カテゴリー（ドロップダウン）
  2. お知らせ
  3. スタッフ募集
  4. よくある質問
  5. お問い合わせ
  6. 無料で使ってみる（CTAボタン）
- 検索アイコン（最右）
- 固定ヘッダー（sticky）

**モバイルヘッダー**:
- ロゴ（縮小版）
- ハンバーガーメニュー（☰）
- 検索アイコン
- CTAボタン維持

**カテゴリメガメニュー**:
- ホバーまたはクリックで展開
- 9大カテゴリ + サブカテゴリ表示
- マルチカラムレイアウト

#### 2.2.2 フッター

**構成**:
- ナビゲーションリンクセクション（カテゴリ別）
- サポートリンク（公式サイト/FAQ/ヘルプ/お問い合わせ）
- 法的リンク（プライバシーポリシー/利用規約）
- ソーシャルメディアリンク
- コピーライト表記: `© 2020-2025 L Message（エルメッセージ）使い方マニュアルサイト.`

**レスポンシブ**:
- デスクトップ: 3-4カラム
- タブレット: 2カラム
- モバイル: 1カラム（縦積み）

#### 2.2.3 検索機能

**検索トリガー**:
- ヘッダー右上の検索アイコン

**検索モーダル**:
- 全画面オーバーレイ
- 検索入力フィールド（大きく、中央配置）
- プレースホルダー: 「キーワードで検索できます」
- クリア/閉じるボタン（×）
- オーバーレイクリックで閉じる

**検索機能**:
- 全文検索（記事タイトル + 本文）
- 日本語対応（ひらがな/カタカナ/漢字）
- キーワードハイライト
- サジェスト機能（オプション）

**検索結果ページ**:
- 記事タイトル（リンク）
- 抜粋文（キーワードハイライト）
- カテゴリバッジ
- サムネイル画像
- ページネーション

#### 2.2.4 パンくずリスト

**表示位置**: ヘッダー直下、メインコンテンツ上部

**構造**:
```
ホーム > カテゴリ > サブカテゴリ > 記事タイトル
```

**特徴**:
- セパレーター: `>`
- 現在ページ: 太字、リンクなし
- 他ページ: 青色リンク
- Schema.org BreadcrumbList対応

**モバイル対応**:
- 長いタイトルは省略記号（...）
- 最後の2-3階層のみ表示（オプション）

#### 2.2.5 目次（TOC）

**デスクトップ版**:
- 右サイドバーに固定（sticky）
- ヘッダー: 「目次」+ 折りたたみボタン（▼/▶）
- 自動生成（H2/H3から）
- 階層表示（インデント）
- スムーススクロール
- アクティブセクションハイライト（緑色）

**モバイル版**:
- コンテンツ直下に配置
- デフォルト折りたたみ
- タップで展開
- スクロール固定なし

### 2.3 その他の機能

#### 2.3.1 Lightbox（画像拡大）

**トリガー**: 画像クリック

**機能**:
- モーダルオーバーレイ表示
- 画像を画面サイズに拡大
- 閉じるボタン（×）
- 背景クリックで閉じる
- 次/前ボタン（複数画像の場合）

#### 2.3.2 動画プレイヤー

**プラットフォーム**: YouTube / Vimeo

**埋め込み設定**:
- レスポンシブ（16:9アスペクト比）
- 自動再生なし
- コントロール表示
- 全画面対応

**YouTube埋め込み例**:
```html
<iframe
  src="https://www.youtube.com/embed/VIDEO_ID?feature=oembed&enablejsapi=1"
  width="100%"
  height="auto"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen
></iframe>
```

#### 2.3.3 カルーセル

**使用箇所**: トップページ（導入事例）

**機能**:
- 左右ナビゲーションボタン
- 自動再生（5秒間隔）
- ドラッグスクロール
- レスポンシブ表示枚数
- インジケーター（ドット）

**ライブラリ**: Swiper.js推奨

#### 2.3.4 アコーディオン

**使用箇所**: FAQ型記事

**機能**:
- 質問をクリックで展開/折りたたみ
- 回答エリアのslideDown/slideUp
- 矢印アイコン回転（▼ → ▲）
- 1つのみ展開（オプション）

---

## 3. 非機能要件

### 3.1 パフォーマンス

**Core Web Vitals目標**:
- LCP (Largest Contentful Paint): < 2.5秒
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

**Lighthouse Score目標**:
- Performance: 90以上
- Accessibility: 95以上
- Best Practices: 95以上
- SEO: 100

**最適化手法**:
- 画像最適化（WebP + lazy loading）
- Next.js Image Optimization
- コード分割（Dynamic Import）
- ISR（Incremental Static Regeneration）
- Vercel Edge Caching
- Font Optimization（Variable Fonts）

### 3.2 SEO

**メタタグ**:
- タイトル: 「記事名 | L Message使い方マニュアル」（60文字以内）
- メタディスクリプション: 120-160文字で概要説明
- OGP（Open Graph Protocol）完備
- Twitter Card対応
- Canonical URL設定

**構造化データ（JSON-LD）**:
- Article（記事ページ）
- HowTo（チュートリアル）
- FAQPage（FAQ型記事）
- BreadcrumbList（パンくずリスト）
- Organization（サイト情報）

**sitemap.xml**:
- 全193ページを含む
- 優先度設定（トップページ 1.0、カテゴリ 0.8、記事 0.6）
- 更新頻度指定

**robots.txt**:
- 検索エンジンクロール許可
- sitemap.xmlの場所指定

### 3.3 アクセシビリティ

**WCAG 2.1 AA準拠**:
- セマンティックHTML使用
- 適切な見出し階層（H1 → H2 → H3）
- 全画像にalt属性
- 十分なコントラスト比（4.5:1以上）
- キーボード操作対応
- フォーカスインジケーター表示
- スクリーンリーダー対応（ARIA属性）

**具体的対応**:
- `<header>`, `<nav>`, `<main>`, `<footer>` 使用
- リンクとボタンの明確な区別
- フォームラベルの適切な関連付け
- タップターゲットサイズ最小44x44px（モバイル）
- 動画に字幕提供（推奨）

### 3.4 セキュリティ

**XSS対策**:
- DOMPurify使用（HTMLサニタイズ）
- Next.js標準のCSP（Content Security Policy）
- 入力値のバリデーション

**認証・認可**:
- Supabase Auth使用
- JWT（JSON Web Token）ベース
- RLS（Row Level Security）設定

**HTTPS**:
- Vercel自動HTTPS
- HSTS（HTTP Strict Transport Security）有効化

**その他**:
- 環境変数の適切な管理（.env.local）
- API キーの秘匿化
- CORS設定

### 3.5 スケーラビリティ

**水平スケーリング**:
- Vercel Edge Functions（サーバーレス）
- Supabase Connection Pooling
- CDN活用（Vercel Edge Network）

**データベース最適化**:
- インデックス設定
- クエリ最適化
- ページネーション実装

**キャッシュ戦略**:
- ISR（Incremental Static Regeneration）
  - トップページ: 60秒
  - カテゴリページ: 300秒（5分）
  - 記事ページ: 3600秒（1時間）
- Vercel Edge Caching
- ブラウザキャッシュ（Cache-Control ヘッダー）

---

## 4. データベース設計

### 4.1 テーブル一覧

**コアテーブル** (17テーブル):
1. `categories` - カテゴリマスター
2. `articles` - 記事マスター
3. `article_sections` - 記事セクション
4. `content_blocks` - コンテンツブロック（JSONB）
5. `case_studies` - 導入事例
6. `case_study_sections` - 導入事例セクション
7. `case_study_metrics` - 成果指標
8. `case_study_features` - 活用機能
9. `news_articles` - お知らせ記事
10. `news_categories` - お知らせカテゴリ
11. `tutorials` - チュートリアル
12. `lessons` - レッスン
13. `lesson_content` - レッスンコンテンツ
14. `video_categories` - 動画カテゴリ
15. `videos` - 動画
16. `tags` - タグ
17. `related_articles` - 関連記事

**進捗管理テーブル** (2テーブル):
18. `user_progress` - ユーザー学習進捗
19. `video_watch_progress` - 動画視聴進捗

**その他テーブル** (2テーブル):
20. `learning_paths` - 学習パス
21. `learning_path_items` - 学習パス項目

### 4.2 テーブル定義

#### 4.2.1 categories（カテゴリ）

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  icon_url TEXT,
  color VARCHAR(7), -- HEX color (#00B900)
  display_order INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_published ON categories(is_published);
```

#### 4.2.2 articles（記事）

```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content JSONB NOT NULL, -- 構造化コンテンツ
  article_type VARCHAR(50) NOT NULL, -- 'tutorial' | 'faq' | 'guide' | 'troubleshooting'
  category_id UUID REFERENCES categories(id),
  featured_image_url TEXT,
  hero_image_url TEXT,
  youtube_video_id VARCHAR(50),
  view_count INTEGER DEFAULT 0,
  helpful_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  meta_tags JSONB, -- SEO metadata
  structured_data JSONB, -- JSON-LD

  -- 全文検索用カラム
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('japanese', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) STORED
);

-- インデックス
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_type ON articles(article_type);
CREATE INDEX idx_articles_published ON articles(is_published, published_at DESC);
CREATE INDEX idx_articles_search ON articles USING gin(search_vector);
```

#### 4.2.3 article_sections（記事セクション）

```sql
CREATE TABLE article_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  heading_level INTEGER NOT NULL, -- 2, 3, 4 (H2, H3, H4)
  heading_text TEXT NOT NULL,
  heading_id VARCHAR(255) NOT NULL, -- アンカーリンク用ID
  content_blocks JSONB NOT NULL, -- セクション内コンテンツ
  display_order INTEGER NOT NULL,
  parent_section_id UUID REFERENCES article_sections(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- 制約
  CONSTRAINT valid_heading_level CHECK (heading_level IN (2, 3, 4))
);

-- インデックス
CREATE INDEX idx_sections_article ON article_sections(article_id, display_order);
CREATE INDEX idx_sections_parent ON article_sections(parent_section_id);
```

#### 4.2.4 content_blocks（コンテンツブロック）

```sql
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES article_sections(id) ON DELETE CASCADE,
  block_type VARCHAR(50) NOT NULL, -- 'text' | 'image' | 'video' | 'code' | 'list' | 'callout' | 'table'
  content JSONB NOT NULL, -- ブロック固有のデータ
  display_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_blocks_section ON content_blocks(section_id, display_order);
```

**content JSONB構造例**:

**テキストブロック**:
```json
{
  "type": "text",
  "paragraphs": [
    {
      "text": "エルメのステップ配信機能を使うと...",
      "formatting": [
        {"start": 4, "end": 10, "type": "bold"},
        {"start": 15, "end": 19, "type": "link", "url": "/manual/greetings/"}
      ]
    }
  ]
}
```

**画像ブロック**:
```json
{
  "type": "image",
  "url": "https://cdn.example.com/step-delivery.png",
  "alt": "ステップ配信の設定画面",
  "caption": "メッセージメニューから「ステップ配信」を選択",
  "width": 1000,
  "height": 600,
  "lightbox": true
}
```

**動画ブロック**:
```json
{
  "type": "video",
  "platform": "youtube",
  "video_id": "ABC123XYZ",
  "title": "L Message（エルメ）のステップ配信 使い方",
  "thumbnail_url": "https://img.youtube.com/vi/ABC123XYZ/maxresdefault.jpg",
  "duration": "5:32"
}
```

**リストブロック**:
```json
{
  "type": "list",
  "list_type": "ordered",
  "items": [
    {"text": "メッセージメニューを開く", "children": []},
    {
      "text": "ステップ配信を選択",
      "children": [
        {"text": "新規作成ボタンをクリック"},
        {"text": "配信名を入力"}
      ]
    }
  ]
}
```

**コールアウトブロック**:
```json
{
  "type": "callout",
  "style": "warning",
  "icon": "⚠️",
  "title": "注意",
  "content": "ステップ配信を削除すると、進行中の配信も停止されます。"
}
```

#### 4.2.5 case_studies（導入事例）

```sql
CREATE TABLE case_studies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  published_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'draft', -- 'draft' | 'published' | 'archived'

  -- ヒーローセクション
  hero_image_url TEXT,
  catchphrase_line1 TEXT,
  catchphrase_line2 TEXT,

  -- 企業情報
  company_name TEXT NOT NULL,
  company_icon_url TEXT,
  company_description TEXT,
  company_url TEXT,
  company_image_url TEXT,

  -- 3つの箱データ
  challenges JSONB, -- [{"text": "課題1"}, ...]
  solutions JSONB,  -- [{"text": "施策1"}, ...]
  results JSONB,    -- [{"text": "成果1"}, ...]

  -- 代理店情報
  agency_name TEXT,
  agency_representative TEXT,
  agency_description TEXT,
  agency_photo_url TEXT,
  agency_interview_link TEXT,

  -- LINE CTA
  line_official_url TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_case_studies_slug ON case_studies(slug);
CREATE INDEX idx_case_studies_status ON case_studies(status);
CREATE INDEX idx_case_studies_published ON case_studies(published_at DESC);
```

#### 4.2.6 case_study_metrics（成果指標）

```sql
CREATE TABLE case_study_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_study_id UUID REFERENCES case_studies(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL, -- 'CPA' | 'ROAS' | 'CVR' | 'リスト獲得数' | '工数削減'
  metric_category TEXT, -- '広告効果' | '業務効率' | '顧客獲得'
  before_value TEXT,
  after_value TEXT,
  improvement_value TEXT,
  improvement_percentage NUMERIC,
  display_order INTEGER,
  highlight BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_metrics_case_study ON case_study_metrics(case_study_id, display_order);
```

#### 4.2.7 news_articles（お知らせ）

```sql
CREATE TABLE news_articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  title VARCHAR(500) NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  featured_image_alt VARCHAR(255),
  content JSONB NOT NULL,
  category_id UUID REFERENCES news_categories(id),
  tags TEXT[],
  meta_title VARCHAR(255),
  meta_description TEXT,
  status VARCHAR(20) DEFAULT 'draft',
  published_at TIMESTAMPTZ,
  maintenance_start TIMESTAMPTZ,
  maintenance_end TIMESTAMPTZ,
  maintenance_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_news_slug ON news_articles(slug);
CREATE INDEX idx_news_status ON news_articles(status);
CREATE INDEX idx_news_published ON news_articles(published_at DESC);
CREATE INDEX idx_news_category ON news_articles(category_id);
CREATE INDEX idx_news_tags ON news_articles USING GIN(tags);
```

#### 4.2.8 tutorials（チュートリアル）

```sql
CREATE TABLE tutorials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tab_category TEXT NOT NULL, -- 'basic' | 'intermediate' | 'advanced'
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_tutorials_tab ON tutorials(tab_category, order_index);
```

#### 4.2.9 lessons（レッスン）

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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_lessons_tutorial ON lessons(tutorial_id, order_index);
```

#### 4.2.10 lesson_content（レッスンコンテンツ）

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

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_lesson_content_lesson ON lesson_content(lesson_id, order_index);
```

#### 4.2.11 video_categories（動画カテゴリ）

```sql
CREATE TABLE video_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  order_index INTEGER NOT NULL,
  is_published BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_video_categories_order ON video_categories(order_index);
```

#### 4.2.12 videos（動画）

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
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_videos_category ON videos(category_id, order_index);
CREATE INDEX idx_videos_platform ON videos(platform);
CREATE INDEX idx_videos_published ON videos(is_published);
```

#### 4.2.13 tags（タグ）

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tags_slug ON tags(slug);
```

#### 4.2.14 article_tags（記事-タグ中間テーブル）

```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

CREATE INDEX idx_article_tags_article ON article_tags(article_id);
CREATE INDEX idx_article_tags_tag ON article_tags(tag_id);
```

#### 4.2.15 related_articles（関連記事）

```sql
CREATE TABLE related_articles (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  related_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  relation_type VARCHAR(50), -- 'manual' | 'auto'
  relevance_score FLOAT,
  PRIMARY KEY (article_id, related_article_id)
);

CREATE INDEX idx_related_article ON related_articles(article_id);
```

#### 4.2.16 user_progress（学習進捗）

```sql
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL, -- auth.users(id)
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started', -- 'not_started' | 'in_progress' | 'completed'
  progress_percentage INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, lesson_id)
);

-- インデックス
CREATE INDEX idx_user_progress_user ON user_progress(user_id);
CREATE INDEX idx_user_progress_lesson ON user_progress(lesson_id);
CREATE INDEX idx_user_progress_status ON user_progress(status);
```

#### 4.2.17 video_watch_progress（動画視聴進捗）

```sql
CREATE TABLE video_watch_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  video_id UUID REFERENCES videos(id) ON DELETE CASCADE,
  watched_seconds INTEGER DEFAULT 0,
  total_seconds INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  completion_percentage INTEGER DEFAULT 0,
  first_watched_at TIMESTAMPTZ DEFAULT NOW(),
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, video_id)
);

-- インデックス
CREATE INDEX idx_video_progress_user ON video_watch_progress(user_id);
CREATE INDEX idx_video_progress_video ON video_watch_progress(video_id);
CREATE INDEX idx_video_progress_completed ON video_watch_progress(completed);
```

### 4.3 リレーション図（ER図）

```
categories (親)
  ├─ categories (子) - 1:N (親子関係)
  └─ articles - 1:N

articles (親)
  ├─ article_sections - 1:N
  ├─ article_tags - N:N (中間テーブル経由)
  └─ related_articles - N:N (自己参照)

article_sections (親)
  ├─ content_blocks - 1:N
  └─ article_sections (子) - 1:N (階層構造)

case_studies (親)
  ├─ case_study_sections - 1:N
  ├─ case_study_metrics - 1:N
  └─ case_study_features - 1:N

news_articles (親)
  └─ news_categories - N:1

tutorials (親)
  └─ lessons - 1:N

lessons (親)
  ├─ lesson_content - 1:N
  └─ user_progress - 1:N

video_categories (親)
  └─ videos - 1:N

videos (親)
  └─ video_watch_progress - 1:N

tags (親)
  └─ article_tags - 1:N
```

### 4.4 RLS（Row Level Security）ポリシー

#### 公開コンテンツ（全員閲覧可能）

```sql
-- articles
CREATE POLICY "Public articles are viewable by everyone"
  ON articles FOR SELECT
  USING (is_published = true);

-- categories
CREATE POLICY "Anyone can view published categories"
  ON categories FOR SELECT
  USING (is_published = true);

-- news_articles
CREATE POLICY "Public news are viewable by everyone"
  ON news_articles FOR SELECT
  USING (status = 'published' AND published_at <= NOW());

-- videos
CREATE POLICY "Anyone can view published videos"
  ON videos FOR SELECT
  USING (is_published = true);
```

#### 認証済みユーザー（下書きも閲覧可能）

```sql
CREATE POLICY "Authenticated users can view all articles"
  ON articles FOR SELECT
  USING (auth.role() = 'authenticated');
```

#### 管理者のみ（作成・更新・削除）

```sql
-- articles
CREATE POLICY "Admins can insert articles"
  ON articles FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can update articles"
  ON articles FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can delete articles"
  ON articles FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');
```

#### ユーザー進捗（本人のみアクセス可能）

```sql
-- user_progress
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

-- video_watch_progress
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
```

### 4.5 インデックス設計

**全文検索用**:
```sql
CREATE INDEX idx_articles_search ON articles USING gin(search_vector);
```

**ソート・フィルタ用**:
```sql
-- 公開日順ソート
CREATE INDEX idx_articles_published_date ON articles(published_at DESC)
  WHERE is_published = true;

-- カテゴリ別フィルタ
CREATE INDEX idx_articles_category_published ON articles(category_id, published_at DESC)
  WHERE is_published = true;

-- 閲覧数順（人気記事）
CREATE INDEX idx_articles_view_count ON articles(view_count DESC)
  WHERE is_published = true;
```

**複合インデックス**:
```sql
-- カテゴリ + タイプ + 公開日
CREATE INDEX idx_articles_cat_type_date ON articles(category_id, article_type, published_at DESC)
  WHERE is_published = true;
```

### 4.6 ビューの作成

#### article_with_category（カテゴリ情報付き記事）

```sql
CREATE VIEW article_with_category AS
SELECT
  a.*,
  c.name AS category_name,
  c.slug AS category_slug,
  c.color AS category_color,
  json_agg(DISTINCT t.*) FILTER (WHERE t.id IS NOT NULL) AS tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE a.is_published = true
GROUP BY a.id, c.id;
```

#### tutorial_with_progress（進捗付きチュートリアル）

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

---

## 5. UI/UXデザイン要件

### 5.1 デザインシステム

#### 5.1.1 カラーパレット

**プライマリカラー**:
```css
--primary-green: #00C300;   /* L Message メイングリーン */
--primary-orange: #FF6B00;  /* CTA オレンジ */
--primary-blue: #0066CC;    /* リンク青 */
```

**セカンダリカラー**:
```css
--gray-50: #F9FAFB;    /* 背景（最も明るい） */
--gray-100: #F3F4F6;   /* 背景 */
--gray-200: #E5E7EB;   /* ボーダー */
--gray-300: #D1D5DB;   /* ボーダー（濃い） */
--gray-600: #4B5563;   /* テキスト（副） */
--gray-900: #111827;   /* テキスト（主） */
```

**アクセントカラー**:
```css
--success-green: #10B981;   /* 成功・改善 */
--warning-yellow: #FBBF24;  /* 注意 */
--danger-red: #EF4444;      /* エラー・削減 */
--info-blue: #3B82F6;       /* 情報 */
```

**背景色**:
```css
--bg-white: #FFFFFF;
--bg-gray-light: #F5F5F5;
--bg-gray: #F9F9F9;
```

**吹き出し背景**:
```css
--quote-bg-client: #F0F9FF;   /* クライアント（青系） */
--quote-bg-agency: #F0FDF4;   /* 代理店（緑系） */
```

#### 5.1.2 タイポグラフィ

**フォントファミリー**:
```css
font-family:
  'Noto Sans JP',
  'Hiragino Sans',
  'Hiragino Kaku Gothic ProN',
  'Yu Gothic',
  'Meiryo',
  sans-serif;
```

**フォントサイズ**:
```css
/* 見出し */
.h1 { font-size: 2rem; }      /* 32px */
.h2 { font-size: 1.75rem; }   /* 28px */
.h3 { font-size: 1.5rem; }    /* 24px */
.h4 { font-size: 1.25rem; }   /* 20px */

/* 本文 */
.body { font-size: 1rem; }    /* 16px */
.small { font-size: 0.875rem; } /* 14px */
.xs { font-size: 0.75rem; }   /* 12px */
```

**フォントウェイト**:
```css
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

**行間**:
```css
--line-height-tight: 1.2;   /* 見出し */
--line-height-normal: 1.5;  /* 見出し（一部） */
--line-height-relaxed: 1.8; /* 本文 */
```

#### 5.1.3 スペーシングシステム

**基準値**: 8px

```css
--spacing-xs: 4px;    /* 0.25rem */
--spacing-sm: 8px;    /* 0.5rem */
--spacing-md: 16px;   /* 1rem */
--spacing-lg: 24px;   /* 1.5rem */
--spacing-xl: 32px;   /* 2rem */
--spacing-2xl: 48px;  /* 3rem */
--spacing-3xl: 64px;  /* 4rem */
--spacing-4xl: 80px;  /* 5rem */
--spacing-5xl: 120px; /* 7.5rem */
```

**セクション間の余白**:
```css
--section-margin: 80px;         /* デスクトップ */
--section-margin-mobile: 60px;  /* モバイル */
```

**ボックス内の余白**:
```css
--box-padding: 24px;         /* デスクトップ */
--box-padding-mobile: 16px;  /* モバイル */
```

#### 5.1.4 レイアウトグリッド

**コンテナ幅**:
```css
--container-max-width: 1200px;  /* メイン */
--content-max-width: 800px;     /* 記事本文 */
```

**グリッドシステム**:
- 12カラムグリッド
- ガター: 24px（デスクトップ）、16px（モバイル）

**ブレークポイント**:
```css
--breakpoint-sm: 576px;   /* モバイル（大） */
--breakpoint-md: 768px;   /* タブレット */
--breakpoint-lg: 1024px;  /* デスクトップ */
--breakpoint-xl: 1280px;  /* デスクトップ（大） */
```

#### 5.1.5 シャドウ

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
--shadow-md: 0 4px 8px rgba(0, 0, 0, 0.12);
--shadow-lg: 0 8px 16px rgba(0, 0, 0, 0.15);
--shadow-xl: 0 12px 24px rgba(0, 0, 0, 0.18);
```

#### 5.1.6 ボーダー半径

```css
--radius-sm: 4px;
--radius: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 9999px; /* 完全な円形 */
```

### 5.2 コンポーネントライブラリ（50+コンポーネント）

#### 5.2.1 グローバルコンポーネント

**Header**:
- DesktopHeader（ロゴ + ナビ + 検索 + CTA）
- MobileHeader（ロゴ + ハンバーガー + 検索）
- MegaMenu（カテゴリドロップダウン）
- SearchModal（検索オーバーレイ）

**Footer**:
- FooterNavigation（カテゴリ別リンク）
- FooterLegal（法的リンク）
- FooterCopyright（著作権表記）

**Sidebar**:
- LeftSidebar（カテゴリツリーナビ）
- RightSidebar（TOC + 広告）

**SearchBar**:
- SearchInput（入力フィールド）
- SearchSuggestions（サジェスト）
- SearchResults（検索結果）

#### 5.2.2 ナビゲーションコンポーネント

**Breadcrumbs**:
- BreadcrumbList（パンくずリスト）
- BreadcrumbItem（各アイテム）
- BreadcrumbSeparator（区切り文字）

**TOC (Table of Contents)**:
- TOCWidget（目次ウィジェット）
- TOCList（目次リスト）
- TOCItem（目次項目、アクティブ状態）

**Pagination**:
- Pagination（ページネーション）
- PageNumber（ページ番号）
- PrevNextButton（前後ボタン）

#### 5.2.3 コンテンツコンポーネント

**ArticleCard**:
- ArticleCardGrid（記事カードグリッド）
- ArticleCard（個別カード: タイトル + 抜粋 + サムネイル）
- CategoryBadge（カテゴリバッジ）

**HeroSection**:
- HeroImage（ヒーロー画像）
- HeroCatchphrase（キャッチコピー）
- HeroText（説明文）

**ThreeBoxes**:
- ThreeBoxesContainer（3カラム親）
- BoxColumn（各カラム: 見出し + リスト）

**QuoteBox**:
- QuoteContainer（吹き出し親）
- QuoteAvatar（アバター + ラベル）
- QuoteContent（吹き出し本文）

**DataTable**:
- Table（テーブル親）
- TableHeader（ヘッダー行）
- TableRow（データ行）
- TableCell（セル）

**CaseStudyCard**:
- CaseStudyCard（導入事例カード）
- CompanyProfile（企業プロフィール）
- AgencyProfile（代理店プロフィール）

#### 5.2.4 インタラクティブコンポーネント

**Lightbox**:
- LightboxModal（モーダル）
- LightboxImage（拡大画像）
- LightboxControls（前後ボタン + 閉じる）

**Accordion**:
- AccordionContainer（親）
- AccordionItem（各項目）
- AccordionHeader（質問 + 矢印アイコン）
- AccordionContent（回答）

**TabNavigation**:
- TabContainer（タブ親）
- TabButton（タブボタン）
- TabPanel（タブコンテンツ）

**Carousel**:
- CarouselContainer（カルーセル親）
- CarouselSlide（各スライド）
- CarouselControls（前後ボタン）
- CarouselIndicators（ドット）

**VideoPlayer**:
- VideoEmbed（YouTube/Vimeo埋め込み）
- VideoThumbnail（サムネイル）
- VideoCaption（キャプション）

#### 5.2.5 フォームコンポーネント

**SearchInput**:
- TextInput（テキスト入力）
- SearchIcon（虫眼鏡アイコン）
- ClearButton（クリアボタン）

**ContactForm**（お問い合わせページ用）:
- FormField（入力フィールド）
- TextArea（テキストエリア）
- SubmitButton（送信ボタン）

#### 5.2.6 レイアウトコンポーネント

**Container**:
- PageContainer（ページ全体コンテナ）
- SectionContainer（セクションコンテナ）
- ContentWrapper（コンテンツラッパー）

**Grid**:
- Grid（グリッドレイアウト）
- GridItem（グリッドアイテム）

**Flex**:
- FlexContainer（フレックスボックス親）
- FlexItem（フレックスアイテム）

#### 5.2.7 UIエレメント

**Button**:
- PrimaryButton（プライマリボタン）
- SecondaryButton（セカンダリボタン）
- OutlineButton（アウトラインボタン）
- LinkButton（リンクボタン）

**Badge**:
- Badge（バッジ）
- CategoryBadge（カテゴリバッジ）
- StatusBadge（ステータスバッジ）

**Icon**:
- Icon（アイコン）
- IconButton（アイコンボタン）
- CategoryIcon（カテゴリアイコン）

**Divider**:
- HorizontalDivider（水平線）
- VerticalDivider（垂直線）

### 5.3 レスポンシブデザインパターン

#### 5.3.1 デスクトップ（> 1024px）

**ヘッダー**:
- フル水平ナビゲーション
- 検索アイコン表示
- CTAボタン表示

**メインコンテンツ**:
- 3カラムレイアウト（左サイドバー + メイン + 右サイドバー）
- カテゴリカード: 3列グリッド
- 記事カード: 3列グリッド

**フッター**:
- 3-4カラム

#### 5.3.2 タブレット（768px - 1024px）

**ヘッダー**:
- ナビゲーション縮小またはハンバーガーメニュー
- 検索アイコン表示

**メインコンテンツ**:
- 2カラムレイアウト（メイン + サイドバー）
- 左サイドバー: 折りたたみ可能
- カテゴリカード: 2列グリッド
- 記事カード: 2列グリッド

**フッター**:
- 2カラム

#### 5.3.3 モバイル（< 768px）

**ヘッダー**:
- ロゴ + ハンバーガーメニュー + 検索
- CTAボタン維持（小さめ）

**メインコンテンツ**:
- 1カラムレイアウト
- 左サイドバー: ハンバーガーメニュー内に移動
- 右サイドバー（TOC）: コンテンツ直下に移動
- カテゴリカード: 1列
- 記事カード: 1列

**フッター**:
- 1カラム（縦積み）

### 5.4 アニメーション・トランジション

**ホバーエフェクト**:
```css
/* カード */
.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  transition: all 0.3s ease;
}

/* ボタン */
.button:hover {
  background-color: var(--primary-green-dark);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 195, 0, 0.2);
  transition: all 0.2s ease;
}
```

**スクロールアニメーション**:
- スムーススクロール（`scroll-behavior: smooth`）
- フェードイン（Intersection Observer使用）

**モーダル表示**:
- フェードイン + スケール
- 背景オーバーレイ（`opacity: 0 → 0.5`）

**アコーディオン**:
- スライドダウン/アップ（`max-height` トランジション）
- 矢印回転（`transform: rotate(180deg)`）

---

## 6. 実装計画

### Phase 1: 基盤構築（1-2週間）

**Week 1**: プロジェクトセットアップ
- [ ] Next.js 14プロジェクト初期化（App Router）
  - `npx create-next-app@latest lme-manual-clone --typescript --tailwind --app`
- [ ] TailwindCSS設定 + shadcn/ui導入
  - `npx shadcn-ui@latest init`
- [ ] ESLint + Prettier設定
- [ ] Husky + lint-staged設定（pre-commit hooks）
- [ ] ディレクトリ構造作成
  ```
  /app
    /api
    /(routes)
      /manual
        /[slug]
        /category/[slug]
        /tutorial
        /learn-video
        /contact
    /components
      /global
      /ui
      /content
    /lib
    /types
  /public
    /images
    /icons
  ```

**Week 2**: Supabaseセットアップ
- [ ] Supabaseプロジェクト作成
- [ ] データベーステーブル作成（17テーブル）
- [ ] RLSポリシー設定
- [ ] Supabase クライアント設定（`@supabase/supabase-js`）
- [ ] 環境変数設定（`.env.local`）

**認証システム**:
- [ ] Supabase Auth設定
- [ ] ログイン/ログアウト機能
- [ ] 認証状態管理（Context API）

**グローバルコンポーネント**:
- [ ] Header（デスクトップ + モバイル）
- [ ] Footer
- [ ] メガメニュー（カテゴリドロップダウン）
- [ ] 検索モーダル
- [ ] パンくずリスト

### Phase 2: 共通コンポーネント開発（2-3週間）

**Week 3-4**: UIコンポーネント
- [ ] デザインシステム実装（Tailwind config）
  - カラーパレット定義
  - タイポグラフィ設定
  - スペーシングスケール
- [ ] ボタンコンポーネント（Primary/Secondary/Outline）
- [ ] カードコンポーネント（Article/Category/CaseStudy）
- [ ] バッジコンポーネント（Category/Status）
- [ ] アイコンコンポーネント（Heroicons使用）

**Week 5**: インタラクティブコンポーネント
- [ ] Breadcrumbs
- [ ] TOC（目次）
  - Intersection Observer実装
  - スムーススクロール
  - アクティブハイライト
- [ ] SearchBar（検索入力 + サジェスト）
- [ ] Lightbox（画像拡大）
- [ ] Accordion（FAQ用）
- [ ] Carousel（Swiper.js統合）
- [ ] VideoPlayer（YouTube/Vimeo埋め込み）

### Phase 3: ページタイプ別実装（4-6週間）

**Week 6**: トップページ + カテゴリページ
- [ ] トップページ（`/manual/`）
  - ヒーローセクション
  - 9カテゴリカード（グリッド）
  - 学習セクション
  - ヘルプセクション
  - お知らせセクション（最新3件）
  - 導入事例カルーセル
- [ ] カテゴリページ（`/manual/category/[slug]/`）
  - カテゴリタイトル + 説明
  - セクション表示
  - 記事カードグリッド
  - サイドバーナビ

**Week 7-8**: 記事・マニュアルページ
- [ ] 記事ページ基本構造（`/manual/[slug]/`）
  - H1タイトル
  - パンくずリスト
  - メインコンテンツエリア
  - 右サイドバーTOC
- [ ] コンテンツレンダリング
  - 段落テキスト
  - 見出し（H2/H3/H4）
  - 箇条書きリスト
  - 画像（Lightbox対応）
  - 動画埋め込み
  - コードブロック
  - 引用・注意書きボックス
- [ ] 4つのページタイプ対応
  - チュートリアル型
  - FAQ型（Accordion）
  - 機能説明型
  - トラブルシューティング型
- [ ] 関連記事表示
- [ ] CTAセクション

**Week 9**: 導入事例 + お知らせ
- [ ] 導入事例ページ（`/manual/interview-[slug]/`）
  - ヒーローセクション
  - キャッチコピー
  - 企業プロフィール
  - 3つの箱（課題・施策・成果）
  - 担当代理店紹介
  - インタビュー本文
  - 吹き出し（QuoteBox）
  - データテーブル
  - CTA
- [ ] お知らせページ（`/manual/[update-slug]/`）
  - アイキャッチ画像
  - タイトル + 日付
  - 導入セクション
  - 目次
  - コンテンツセクション
  - 画像拡大機能
  - カテゴリータグ

**Week 10**: チュートリアル + 動画学習
- [ ] チュートリアルページ（`/manual/tutorial/`）
  - タブナビゲーション（3タブ）
  - タブコンテンツ切り替え
  - レッスン表示（H2/H3構造）
  - 動画埋め込み（Vimeo/YouTube）
  - 関連マニュアルリンク
- [ ] 動画学習ページ（`/manual/learn-video/`）
  - カテゴリナビゲーション（横スクロール）
  - 動画カードグリッド
  - 動画埋め込み（レスポンシブ）

**Week 11**: お問い合わせ + 404/500
- [ ] お問い合わせページ（`/manual/contact/`）
  - 5つのセクション
  - 外部リンクボタン
  - 注意事項表示
- [ ] 404ページ（Not Found）
- [ ] 500ページ（Server Error）

### Phase 4: コンテンツ移行（2-3週間）

**Week 12**: スクレイピングスクリプト作成
- [ ] Playwright環境構築
- [ ] 全193ページのURL取得
- [ ] ページタイプ別スクレイパー実装
  - カテゴリページスクレイパー
  - 記事ページスクレイパー
  - 導入事例スクレイパー
  - お知らせスクレイパー
  - チュートリアル/動画学習スクレイパー
- [ ] 並列処理実装（20並列）
- [ ] レート制限対策（0.5秒待機）
- [ ] エラーハンドリング（3回リトライ）

**Week 13**: データ整形・クレンジング
- [ ] HTML → JSONB構造化
- [ ] 画像URL抽出・ダウンロード
  - 画像最適化（WebP変換）
  - Supabase Storageにアップロード
- [ ] 動画ID抽出（YouTube/Vimeo）
- [ ] カテゴリ・タグ自動分類
- [ ] 見出し階層解析（TOC生成用）
- [ ] 関連記事リンク抽出

**Week 14**: Supabaseインポート
- [ ] PostgreSQL COPY コマンド準備
- [ ] バッチインサート（1000件ずつ）
- [ ] 外部キー整合性チェック
- [ ] データ検証（全193ページ）
- [ ] 全文検索インデックス作成

### Phase 5: 最適化・テスト（2-3週間）

**Week 15**: パフォーマンス最適化
- [ ] Lighthouse監査（全ページ）
- [ ] Core Web Vitals測定
- [ ] 画像最適化
  - Next.js Image最適化
  - Lazy loading
  - WebP + フォールバック
- [ ] コード最適化
  - Dynamic Import
  - Tree Shaking
  - Bundle size削減
- [ ] ISR設定
  - トップページ: 60秒
  - カテゴリページ: 300秒
  - 記事ページ: 3600秒
- [ ] Vercel Edge Caching設定

**Week 16**: SEO設定
- [ ] メタタグ設定（全ページ）
  - タイトル
  - ディスクリプション
  - OGP
  - Twitter Card
- [ ] 構造化データ実装（JSON-LD）
  - Article
  - HowTo
  - FAQPage
  - BreadcrumbList
- [ ] sitemap.xml生成
- [ ] robots.txt作成
- [ ] Canonical URL設定

**Week 17**: アクセシビリティ監査
- [ ] WCAG 2.1 AA準拠チェック
- [ ] スクリーンリーダーテスト（NVDA/VoiceOver）
- [ ] キーボード操作テスト
- [ ] カラーコントラスト比チェック
- [ ] ARIA属性追加
- [ ] フォーカス管理改善

**Week 18**: クロスブラウザテスト + デプロイ
- [ ] ブラウザ互換性テスト
  - Chrome
  - Safari
  - Firefox
  - Edge
- [ ] デバイステスト
  - Desktop（Windows/Mac）
  - Tablet（iPad）
  - Mobile（iPhone/Android）
- [ ] E2Eテスト（Playwright）
  - 主要フロー
  - 検索機能
  - ナビゲーション
  - フォーム送信
- [ ] Vercel本番デプロイ
- [ ] 本番環境監視設定

---

## 7. データ移行計画

### 7.1 スクレイピング戦略

**ツール**: Playwright

**並列処理**:
- 同時実行数: 20並列
- キュー管理: p-queueライブラリ使用
- レート制限: 各リクエスト間 0.5秒待機

**エラーハンドリング**:
- リトライ回数: 3回
- タイムアウト: 30秒/ページ
- エラーログ: `./logs/scraping-errors.log`

**実装例**:
```typescript
import { chromium } from 'playwright';
import PQueue from 'p-queue';

const queue = new PQueue({ concurrency: 20 });
const RETRY_COUNT = 3;
const RETRY_DELAY = 500; // ms

async function scrapePage(url: string, retries = RETRY_COUNT): Promise<PageData> {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // スクレイピング処理
    const data = await extractPageData(page);

    return data;
  } catch (error) {
    if (retries > 0) {
      console.log(`リトライ: ${url} (残り${retries}回)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return scrapePage(url, retries - 1);
    }
    throw error;
  } finally {
    await browser.close();
  }
}

async function scrapeAllPages(urls: string[]) {
  const results = await queue.addAll(
    urls.map(url => () => scrapePage(url))
  );
  return results;
}
```

### 7.2 コンテンツ整形

**HTML → JSONB変換**:
```typescript
interface ContentBlock {
  type: 'text' | 'image' | 'video' | 'code' | 'list' | 'callout';
  content: any;
  order: number;
}

function parseHTMLToBlocks(html: string): ContentBlock[] {
  const $ = cheerio.load(html);
  const blocks: ContentBlock[] = [];
  let order = 0;

  $('body > *').each((i, elem) => {
    const tagName = elem.tagName.toLowerCase();

    if (tagName === 'p') {
      blocks.push({
        type: 'text',
        content: { paragraphs: [{ text: $(elem).text() }] },
        order: order++
      });
    } else if (tagName === 'img') {
      blocks.push({
        type: 'image',
        content: {
          url: $(elem).attr('src'),
          alt: $(elem).attr('alt'),
          lightbox: true
        },
        order: order++
      });
    }
    // ... 他のタイプも同様
  });

  return blocks;
}
```

**画像処理**:
```typescript
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

async function processAndUploadImage(imageUrl: string): Promise<string> {
  // 画像ダウンロード
  const response = await fetch(imageUrl);
  const buffer = await response.arrayBuffer();

  // WebP変換
  const webpBuffer = await sharp(Buffer.from(buffer))
    .webp({ quality: 80 })
    .toBuffer();

  // Supabase Storageにアップロード
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  const filename = `${uuidv4()}.webp`;

  const { data, error } = await supabase.storage
    .from('images')
    .upload(`manual/${filename}`, webpBuffer, {
      contentType: 'image/webp',
      cacheControl: '31536000' // 1年キャッシュ
    });

  if (error) throw error;

  return `${process.env.SUPABASE_URL}/storage/v1/object/public/images/manual/${filename}`;
}
```

**動画ID抽出**:
```typescript
function extractVideoId(embedUrl: string): { platform: string; videoId: string } {
  if (embedUrl.includes('youtube.com') || embedUrl.includes('youtu.be')) {
    const match = embedUrl.match(/(?:youtube\.com\/embed\/|youtu\.be\/)([^?&]+)/);
    return { platform: 'youtube', videoId: match![1] };
  } else if (embedUrl.includes('vimeo.com')) {
    const match = embedUrl.match(/vimeo\.com\/video\/(\d+)/);
    return { platform: 'vimeo', videoId: match![1] };
  }
  throw new Error(`未対応の動画プラットフォーム: ${embedUrl}`);
}
```

### 7.3 Supabaseインポート

**バッチインサート実装**:
```typescript
async function batchInsert<T>(
  tableName: string,
  data: T[],
  batchSize = 1000
): Promise<void> {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);

    const { error } = await supabase
      .from(tableName)
      .insert(batch);

    if (error) {
      console.error(`エラー: ${tableName} (batch ${i / batchSize + 1})`, error);
      throw error;
    }

    console.log(`✓ ${tableName}: ${i + batch.length}/${data.length} 件インサート完了`);
  }
}
```

**データ整合性チェック**:
```typescript
async function validateData() {
  const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);

  // 総記事数チェック
  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true });

  console.log(`記事数: ${articleCount}/193`);

  // 外部キー整合性チェック
  const { data: orphanedArticles } = await supabase
    .from('articles')
    .select('id, title, category_id')
    .is('category_id', null);

  if (orphanedArticles && orphanedArticles.length > 0) {
    console.warn(`警告: カテゴリ未設定の記事が ${orphanedArticles.length} 件あります`);
  }

  // 画像URLチェック
  const { data: brokenImages } = await supabase
    .rpc('check_broken_images');

  if (brokenImages && brokenImages.length > 0) {
    console.warn(`警告: 壊れた画像URLが ${brokenImages.length} 件あります`);
  }
}
```

### 7.4 移行スクリプト実行手順

**1. 環境準備**:
```bash
# 依存パッケージインストール
npm install playwright cheerio sharp @supabase/supabase-js p-queue

# Playwrightブラウザインストール
npx playwright install chromium
```

**2. スクレイピング実行**:
```bash
# 全ページスクレイピング
npm run scrape:all

# カテゴリページのみ
npm run scrape:categories

# 記事ページのみ
npm run scrape:articles
```

**3. データ整形**:
```bash
# HTML → JSONB変換
npm run transform:content

# 画像処理・アップロード
npm run process:images

# 動画ID抽出
npm run extract:videos
```

**4. Supabaseインポート**:
```bash
# カテゴリインポート
npm run import:categories

# 記事インポート
npm run import:articles

# 全テーブルインポート
npm run import:all
```

**5. データ検証**:
```bash
# 整合性チェック
npm run validate:data

# 全文検索インデックス作成
npm run create:search-index
```

---

## 8. TODOリスト（完全版）

### Phase 1: 基盤構築

**プロジェクトセットアップ**:
- [ ] (高) Next.jsプロジェクト初期化 - 2h
- [ ] (高) TypeScript設定 - 1h
- [ ] (高) TailwindCSS設定 - 1h
- [ ] (高) shadcn/ui導入 - 1h
- [ ] (高) ESLint + Prettier設定 - 1h
- [ ] (高) Husky + lint-staged設定 - 1h
- [ ] (高) ディレクトリ構造作成 - 1h
- [ ] (高) .gitignore設定 - 0.5h
- [ ] (高) README.md作成 - 1h

**Supabaseセットアップ**:
- [ ] (高) Supabaseプロジェクト作成 - 0.5h
- [ ] (高) categories テーブル作成 - 1h
- [ ] (高) articles テーブル作成 - 2h
- [ ] (高) article_sections テーブル作成 - 1h
- [ ] (高) content_blocks テーブル作成 - 1h
- [ ] (高) case_studies テーブル作成 - 1.5h
- [ ] (高) case_study_metrics テーブル作成 - 1h
- [ ] (高) news_articles テーブル作成 - 1h
- [ ] (高) tutorials テーブル作成 - 0.5h
- [ ] (高) lessons テーブル作成 - 1h
- [ ] (高) lesson_content テーブル作成 - 1h
- [ ] (高) video_categories テーブル作成 - 0.5h
- [ ] (高) videos テーブル作成 - 1h
- [ ] (高) tags テーブル作成 - 0.5h
- [ ] (高) article_tags テーブル作成 - 0.5h
- [ ] (高) related_articles テーブル作成 - 0.5h
- [ ] (高) user_progress テーブル作成 - 1h
- [ ] (高) video_watch_progress テーブル作成 - 1h
- [ ] (高) RLSポリシー設定 (全テーブル) - 4h
- [ ] (高) インデックス作成 - 2h
- [ ] (高) ビュー作成 - 1h
- [ ] (中) Supabaseクライアント設定 - 1h
- [ ] (中) 環境変数設定 - 0.5h

**認証システム**:
- [ ] (中) Supabase Auth設定 - 2h
- [ ] (中) ログイン/ログアウト機能 - 3h
- [ ] (中) 認証状態管理 (Context API) - 2h
- [ ] (低) ユーザープロフィールページ - 4h

**グローバルコンポーネント**:
- [ ] (高) Headerコンポーネント (デスクトップ) - 4h
- [ ] (高) Headerコンポーネント (モバイル) - 3h
- [ ] (高) Footerコンポーネント - 3h
- [ ] (高) メガメニューコンポーネント - 6h
- [ ] (高) 検索モーダルコンポーネント - 4h
- [ ] (高) パンくずリストコンポーネント - 2h

### Phase 2: 共通コンポーネント

**デザインシステム**:
- [ ] (高) Tailwind config (カラーパレット) - 2h
- [ ] (高) Tailwind config (タイポグラフィ) - 1h
- [ ] (高) Tailwind config (スペーシング) - 1h
- [ ] (高) Tailwind config (シャドウ) - 1h
- [ ] (高) Tailwind config (ブレークポイント) - 0.5h

**UIコンポーネント**:
- [ ] (高) Buttonコンポーネント (Primary) - 2h
- [ ] (高) Buttonコンポーネント (Secondary) - 1h
- [ ] (高) Buttonコンポーネント (Outline) - 1h
- [ ] (高) Badgeコンポーネント - 1h
- [ ] (高) Iconコンポーネント (Heroicons統合) - 2h
- [ ] (高) Dividerコンポーネント - 0.5h
- [ ] (中) Cardコンポーネントベース - 2h
- [ ] (中) ArticleCardコンポーネント - 3h
- [ ] (中) CategoryCardコンポーネント - 3h
- [ ] (中) CaseStudyCardコンポーネント - 4h

**インタラクティブコンポーネント**:
- [ ] (高) TOC (目次) コンポーネント - 6h
  - [ ] Intersection Observer実装 - 2h
  - [ ] スムーススクロール - 1h
  - [ ] アクティブハイライト - 2h
  - [ ] 折りたたみ機能 - 1h
- [ ] (高) Lightboxコンポーネント - 4h
- [ ] (高) Accordionコンポーネント - 3h
- [ ] (高) Carouselコンポーネント (Swiper統合) - 5h
- [ ] (高) VideoPlayerコンポーネント - 3h
- [ ] (中) SearchBarコンポーネント - 4h
- [ ] (中) Paginationコンポーネント - 2h
- [ ] (中) TabNavigationコンポーネント - 3h

### Phase 3: ページ実装

**トップページ**:
- [ ] (高) ヒーローセクション - 3h
- [ ] (高) カテゴリカードグリッド (9カテゴリ) - 6h
- [ ] (高) 学習セクション - 2h
- [ ] (高) ヘルプセクション - 2h
- [ ] (高) お知らせセクション (最新3件) - 3h
- [ ] (高) 導入事例カルーセル - 4h
- [ ] (中) ページレイアウト調整 - 2h
- [ ] (中) レスポンシブ対応 - 3h

**カテゴリページ**:
- [ ] (高) カテゴリページレイアウト - 3h
- [ ] (高) セクション表示 - 2h
- [ ] (高) 記事カードグリッド - 3h
- [ ] (高) サイドバーナビ - 3h
- [ ] (中) ページネーション統合 - 2h
- [ ] (中) レスポンシブ対応 - 2h

**記事・マニュアルページ**:
- [ ] (高) 基本レイアウト (3カラム) - 3h
- [ ] (高) コンテンツレンダリングエンジン - 8h
  - [ ] テキストブロック - 1h
  - [ ] 画像ブロック (Lightbox統合) - 2h
  - [ ] 動画ブロック - 2h
  - [ ] コードブロック - 1h
  - [ ] リストブロック - 1h
  - [ ] コールアウトブロック - 1h
- [ ] (高) 4つのページタイプ対応 - 6h
  - [ ] チュートリアル型 - 1.5h
  - [ ] FAQ型 (Accordion統合) - 2h
  - [ ] 機能説明型 - 1.5h
  - [ ] トラブルシューティング型 - 1h
- [ ] (高) 関連記事セクション - 2h
- [ ] (高) CTAセクション - 1h
- [ ] (中) レスポンシブ対応 - 3h

**導入事例ページ**:
- [ ] (高) ヒーローセクション - 2h
- [ ] (高) 企業プロフィールボックス - 2h
- [ ] (高) 3つの箱 (課題・施策・成果) - 3h
- [ ] (高) 担当代理店紹介 - 2h
- [ ] (高) インタビュー本文レンダリング - 4h
- [ ] (高) 吹き出し (QuoteBox) コンポーネント - 2h
- [ ] (高) データテーブルコンポーネント - 3h
- [ ] (中) CTAセクション - 1h
- [ ] (中) レスポンシブ対応 - 2h

**お知らせページ**:
- [ ] (高) アイキャッチ画像 - 1h
- [ ] (高) タイトル + 日付 - 1h
- [ ] (高) 導入セクション - 1h
- [ ] (高) 目次 (折りたたみ) - 1h
- [ ] (高) コンテンツセクション - 2h
- [ ] (高) 画像拡大機能 (Lightbox統合) - 1h
- [ ] (中) カテゴリータグ - 1h
- [ ] (中) レスポンシブ対応 - 1h

**チュートリアルページ**:
- [ ] (高) タブナビゲーション (3タブ) - 3h
- [ ] (高) タブコンテンツ切り替え - 2h
- [ ] (高) レッスン表示 (H2/H3構造) - 2h
- [ ] (高) 動画埋め込み (Vimeo/YouTube) - 2h
- [ ] (中) 関連マニュアルリンク - 1h
- [ ] (中) レスポンシブ対応 - 2h

**動画学習ページ**:
- [ ] (高) カテゴリナビゲーション (横スクロール) - 2h
- [ ] (高) 動画カードグリッド - 3h
- [ ] (高) 動画埋め込み (レスポンシブ) - 2h
- [ ] (中) レスポンシブ対応 - 2h

**お問い合わせページ**:
- [ ] (高) 5つのセクション - 3h
- [ ] (高) 外部リンクボタン - 1h
- [ ] (中) 注意事項表示 - 1h
- [ ] (中) レスポンシブ対応 - 1h

**エラーページ**:
- [ ] (中) 404ページ - 2h
- [ ] (中) 500ページ - 1h

### Phase 4: コンテンツ移行

**スクレイピング**:
- [ ] (高) Playwright環境構築 - 1h
- [ ] (高) 全193ページURL取得 - 1h
- [ ] (高) カテゴリページスクレイパー - 4h
- [ ] (高) 記事ページスクレイパー - 6h
- [ ] (高) 導入事例スクレイパー - 3h
- [ ] (高) お知らせスクレイパー - 2h
- [ ] (高) チュートリアル/動画学習スクレイパー - 2h
- [ ] (高) 並列処理実装 (20並列) - 3h
- [ ] (高) レート制限対策 - 1h
- [ ] (高) エラーハンドリング (3回リトライ) - 2h
- [ ] (中) スクレイピングログ記録 - 1h

**データ整形**:
- [ ] (高) HTML → JSONB変換 - 6h
- [ ] (高) 画像URL抽出・ダウンロード - 4h
- [ ] (高) 画像最適化 (WebP変換) - 3h
- [ ] (高) Supabase Storageアップロード - 2h
- [ ] (高) 動画ID抽出 (YouTube/Vimeo) - 2h
- [ ] (中) カテゴリ・タグ自動分類 - 3h
- [ ] (中) 見出し階層解析 (TOC生成用) - 2h
- [ ] (中) 関連記事リンク抽出 - 2h

**Supabaseインポート**:
- [ ] (高) categoriesインポート - 1h
- [ ] (高) articlesインポート - 3h
- [ ] (高) article_sectionsインポート - 2h
- [ ] (高) content_blocksインポート - 2h
- [ ] (高) case_studiesインポート - 2h
- [ ] (高) news_articlesインポート - 1h
- [ ] (高) tutorialsインポート - 1h
- [ ] (高) lessonsインポート - 1h
- [ ] (高) video_categoriesインポート - 0.5h
- [ ] (高) videosインポート - 1h
- [ ] (高) tagsインポート - 1h
- [ ] (高) 外部キー整合性チェック - 2h
- [ ] (高) データ検証 (全193ページ) - 2h
- [ ] (中) 全文検索インデックス作成 - 1h

### Phase 5: 最適化・テスト

**パフォーマンス最適化**:
- [ ] (高) Lighthouse監査 (全ページタイプ) - 4h
- [ ] (高) Core Web Vitals測定 - 2h
- [ ] (高) 画像最適化 (Next.js Image) - 3h
- [ ] (高) Lazy loading実装 - 2h
- [ ] (高) WebP + フォールバック - 2h
- [ ] (高) Dynamic Import実装 - 3h
- [ ] (高) Tree Shaking確認 - 1h
- [ ] (高) Bundle size削減 - 2h
- [ ] (高) ISR設定 (全ページタイプ) - 3h
- [ ] (中) Vercel Edge Caching設定 - 1h
- [ ] (中) Font Optimization - 1h

**SEO設定**:
- [ ] (高) メタタグ設定 (全ページタイプ) - 4h
- [ ] (高) 構造化データ実装 (Article) - 2h
- [ ] (高) 構造化データ実装 (HowTo) - 2h
- [ ] (高) 構造化データ実装 (FAQPage) - 2h
- [ ] (高) 構造化データ実装 (BreadcrumbList) - 1h
- [ ] (高) sitemap.xml生成 - 2h
- [ ] (高) robots.txt作成 - 0.5h
- [ ] (高) Canonical URL設定 - 1h
- [ ] (中) OGP画像生成 - 2h
- [ ] (中) Twitter Card設定 - 1h

**アクセシビリティ監査**:
- [ ] (高) WCAG 2.1 AA準拠チェック - 4h
- [ ] (高) スクリーンリーダーテスト (NVDA) - 2h
- [ ] (高) スクリーンリーダーテスト (VoiceOver) - 2h
- [ ] (高) キーボード操作テスト - 2h
- [ ] (高) カラーコントラスト比チェック - 1h
- [ ] (中) ARIA属性追加 - 3h
- [ ] (中) フォーカス管理改善 - 2h
- [ ] (低) 動画字幕提供 - 4h

**クロスブラウザテスト**:
- [ ] (高) Chromeテスト - 2h
- [ ] (高) Safariテスト - 2h
- [ ] (高) Firefoxテスト - 2h
- [ ] (高) Edgeテスト - 2h
- [ ] (中) iPadテスト - 1h
- [ ] (中) iPhoneテスト - 1h
- [ ] (中) Androidテスト - 1h

**E2Eテスト**:
- [ ] (高) Playwright環境構築 - 1h
- [ ] (高) 主要フローテスト (ナビゲーション) - 3h
- [ ] (高) 検索機能テスト - 2h
- [ ] (中) フォーム送信テスト - 2h
- [ ] (中) Lightboxテスト - 1h
- [ ] (中) Carouselテスト - 1h

**デプロイ**:
- [ ] (高) Vercel設定 - 1h
- [ ] (高) 環境変数設定 (本番) - 1h
- [ ] (高) ドメイン設定 - 1h
- [ ] (高) 本番デプロイ - 2h
- [ ] (中) 本番環境監視設定 - 2h
- [ ] (中) エラートラッキング (Sentry) - 2h

**ドキュメント**:
- [ ] (中) README.md更新 - 2h
- [ ] (中) API仕様書作成 - 3h
- [ ] (中) デプロイ手順書作成 - 2h
- [ ] (低) コンポーネントカタログ作成 - 4h

---

**総見積もり時間**: 約400-500時間（10-12週間、1人作業の場合）

**優先度別タスク数**:
- 高優先度: 約150タスク
- 中優先度: 約60タスク
- 低優先度: 約10タスク

---

## 9. 技術的制約と前提条件

### 9.1 前提条件

**開発環境**:
- Node.js 18+
- npm または yarn
- Git

**アカウント**:
- Supabase アカウント
- Vercel アカウント
- GitHub アカウント

**ブラウザ**:
- Chrome/Edge 最新版（開発・テスト用）
- Safari 最新版（テスト用）
- Firefox 最新版（テスト用）

### 9.2 技術的制約

**Next.js**:
- App Router必須（Pages Routerは使用不可）
- Server Components優先
- Client Componentsは最小限

**Supabase**:
- Free Tier制限:
  - Database: 500MB
  - Storage: 1GB
  - Bandwidth: 2GB/月
- Pro Tier推奨（$25/月）:
  - Database: 8GB
  - Storage: 100GB
  - Bandwidth: 50GB/月

**Vercel**:
- Hobby Plan制限:
  - Bandwidth: 100GB/月
  - ビルド時間: 6000分/月
- Pro Plan推奨（$20/月）:
  - Bandwidth: 1TB/月
  - ビルド時間: 無制限

**画像・動画**:
- 画像総容量: 約2-3GB（推定）
- 動画: YouTube/Vimeo埋め込み（ホスティング不要）

### 9.3 依存関係

**主要ライブラリ**:
```json
{
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@supabase/supabase-js": "^2.39.0",
    "@supabase/auth-helpers-nextjs": "^0.9.0",
    "tailwindcss": "^3.4.0",
    "framer-motion": "^11.0.0",
    "swiper": "^11.0.0",
    "cheerio": "^1.0.0-rc.12",
    "dompurify": "^3.0.0",
    "isomorphic-dompurify": "^2.0.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^18.3.0",
    "typescript": "^5.3.0",
    "eslint": "^8.57.0",
    "prettier": "^3.2.0",
    "playwright": "^1.42.0",
    "@playwright/test": "^1.42.0",
    "sharp": "^0.33.0",
    "p-queue": "^8.0.0"
  }
}
```

---

## 10. リスク管理

### 10.1 主要リスクと対策

#### リスク1: スクレイピングの法的問題

**リスクレベル**: 高

**内容**:
- 元サイトの利用規約違反
- 著作権侵害
- 不正アクセス禁止法違反

**対策**:
- robots.txtを確認（スクレイピング許可確認）
- レート制限実装（サーバー負荷を最小限に）
- User-Agent明記（スクレイパー識別可能に）
- 必要に応じて元サイト運営者に許可取得

**contingency plan**:
- 許可が得られない場合: コンテンツを手動で入力
- 法的問題が発生した場合: 即座にスクレイピング停止、データ削除

#### リスク2: パフォーマンス劣化

**リスクレベル**: 中

**内容**:
- ページ読み込み速度低下
- Core Web Vitals未達成
- Vercel Bandwidth超過

**対策**:
- ISR実装（静的生成 + 定期再検証）
- 画像最適化（WebP + lazy loading）
- Vercel Edge Caching活用
- コード分割（Dynamic Import）

**contingency plan**:
- Vercel Pro Planへアップグレード
- CDN追加（Cloudflare等）
- 画像をさらに圧縮

#### リスク3: データ移行エラー

**リスクレベル**: 中

**内容**:
- スクレイピング失敗（一部ページ）
- データ整形エラー
- 外部キー整合性エラー

**対策**:
- リトライ機能実装（3回）
- エラーログ詳細記録
- データ検証スクリプト作成
- バックアップ戦略（毎日自動バックアップ）

**contingency plan**:
- 失敗ページは手動でデータ入力
- Supabase Database Backupから復元
- トランザクション使用（ロールバック可能に）

#### リスク4: Supabase容量超過

**リスクレベル**: 低-中

**内容**:
- Database容量超過（500MB Free Tier）
- Storage容量超過（1GB Free Tier）
- Bandwidth超過（2GB/月 Free Tier）

**対策**:
- 画像圧縮（WebP、品質80）
- 不要データ削除（古いバージョン等）
- Pro Planへアップグレード（事前計画）

**contingency plan**:
- Pro Planへ即座にアップグレード（$25/月）
- 画像を外部CDN（Cloudinary等）に移動

#### リスク5: スケジュール遅延

**リスクレベル**: 中

**内容**:
- 開発期間が予定を超過
- リソース不足
- 想定外の技術的課題

**対策**:
- バッファ期間設定（各フェーズに1週間）
- 優先度管理（高優先度タスクを先に）
- MVP定義（最小限の機能で初期リリース）

**contingency plan**:
- 段階的リリース（カテゴリごとに公開）
- 外部リソース活用（フリーランサー雇用等）
- 一部機能の後回し（進捗管理機能等）

### 10.2 リスク監視指標

**週次チェック項目**:
- [ ] スクレイピング成功率（> 95%）
- [ ] Lighthouse Score（> 90）
- [ ] データベース容量（< 80%）
- [ ] Vercel Bandwidth使用量（< 80%）
- [ ] タスク完了率（計画通り）

**月次チェック項目**:
- [ ] Supabase費用（予算内）
- [ ] Vercel費用（予算内）
- [ ] 技術的負債レビュー
- [ ] セキュリティ監査

---

## 付録A: 用語集

**App Router**: Next.js 13+の新しいルーティングシステム

**ISR**: Incremental Static Regeneration（インクリメンタル静的再生成）

**RLS**: Row Level Security（行レベルセキュリティ）

**TOC**: Table of Contents（目次）

**OGP**: Open Graph Protocol（SNSシェア用メタデータ）

**JSON-LD**: JSON for Linking Data（構造化データ形式）

**WCAG**: Web Content Accessibility Guidelines（ウェブアクセシビリティガイドライン）

**Core Web Vitals**: Googleが定義するユーザー体験指標（LCP/FID/CLS）

---

## 付録B: 参考リンク

**公式ドキュメント**:
- Next.js: https://nextjs.org/docs
- Supabase: https://supabase.com/docs
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/
- Vercel: https://vercel.com/docs

**ツール**:
- Playwright: https://playwright.dev/
- Lighthouse: https://developers.google.com/web/tools/lighthouse
- NVDA: https://www.nvaccess.org/

**標準・ガイドライン**:
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/
- Schema.org: https://schema.org/
- Core Web Vitals: https://web.dev/vitals/

---

**作成日**: 2025-10-29
**バージョン**: 1.0
**作成者**: Claude (Anthropic)
**レビュー状態**: 初版

---

**END OF DOCUMENT**
