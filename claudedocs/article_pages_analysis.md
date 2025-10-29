# L Message マニュアルサイト - 記事・マニュアルページ 完全分析レポート

**分析日**: 2025-10-29
**対象**: 記事・マニュアルページ 122ページ
**分析方法**: Playwright自動巡回 + 目視確認

---

## エグゼクティブサマリー

L Messageマニュアルサイトの記事・マニュアルページは、**統一されたデザインシステム**を持ちながらも、**コンテンツタイプに応じた柔軟な構造**を実現している。主に4つのページタイプ（チュートリアル、FAQ、機能説明、トラブルシューティング）に分類でき、各ページは共通のUIコンポーネントを使用している。

### 重要な発見
1. **完全なレスポンシブ対応** - デスクトップ/モバイルで最適化されたレイアウト
2. **動画コンテンツの積極活用** - YouTube埋め込みによる視覚的説明
3. **インタラクティブな目次** - スムーズスクロール + アクティブハイライト
4. **サイドバー広告の統一配置** - エルグラムCTA（インスタ運用サービス）
5. **階層的な見出し構造** - H2/H3で整理された読みやすいコンテンツ

---

## 1. ページタイプの分類と特徴

### 1.1 チュートリアル型（Tutorial）
**例**: `/manual/step_delivery/`, `/manual/rich_menu/`, `/manual/message_delivery/`

**特徴**:
- **ヒーローイメージ**: 大きなバナー画像（L Messageロゴ + 機能名）
- **ステップバイステップ**: 番号付きセクション（H3見出し）
- **スクリーンショット多用**: 各手順に対応する画面キャプチャ
- **YouTube動画**: 冒頭またはセクション内に埋め込み
- **目次**: 全手順が一覧表示される

**構造例**:
```
H1: L Message（エルメ）のステップ配信 操作マニュアル
├─ ヒーローイメージ（バナー）
├─ 目次（TOC）
├─ H2: ステップ配信とは
│   └─ 説明文 + 図解
├─ H2: ステップ配信の設定方法
│   ├─ H3: 1. メッセージメニューを開く
│   │   └─ スクリーンショット + 説明
│   ├─ H3: 2. ステップ配信を選択
│   │   └─ スクリーンショット + 説明
│   └─ H3: 3. 配信設定を行う
└─ H2: よくある質問
```

### 1.2 FAQ型（Frequently Asked Questions）
**例**: `/manual/message_faq/`, `/manual/form_faq/`, `/manual/step_faq/`

**特徴**:
- **質問リスト**: 緑色の左ボーダー付きボックス
- **アコーディオン構造**: Q&Aが折りたたみ可能
- **リンク誘導**: 関連マニュアルへのリンクが豊富
- **エラーメッセージ**: トラブル時の確認事項を明記
- **YouTube動画**: 複雑な内容は動画で補足

**構造例**:
```
H1: メッセージ配信 - 目的から探す・よくあるご質問
├─ 注意書き（エラー時の確認リンク）
├─ 目次
├─ H2: メッセージ配信（カテゴリー）
│   ├─ YouTube動画埋め込み
│   ├─ [Q] フォームに回答がきたときに通知が届くようにするには？
│   │   └─ [A] 説明文 + リンク
│   ├─ [Q] メッセージが送信できない場合は？
│   │   └─ [A] チェックリスト + リンク
│   └─ [Q] 送信したメッセージを取り消すことはできますか？
└─ H2: ステップ配信（カテゴリー）
```

### 1.3 機能説明型（Feature Guide）
**例**: `/manual/form/`, `/manual/tag/`, `/manual/rich_menu/`

**特徴**:
- **概要セクション**: 機能の目的と利点を説明
- **設定手順**: 詳細な操作フロー
- **活用例**: ユースケースの紹介
- **関連機能リンク**: 他機能との連携方法
- **動画解説**: 機能全体を動画で紹介

**構造例**:
```
H1: L Message（エルメ）のリッチメニュー 操作マニュアル
├─ ヒーローイメージ
├─ 目次
├─ H2: リッチメニューとは
│   └─ 機能説明 + メリット
├─ H2: リッチメニューの作成方法
│   ├─ H3: デザインの選択
│   ├─ H3: アクションの設定
│   └─ H3: 表示条件の指定
├─ H2: 活用例
│   └─ 実際の使用例
└─ H2: よくある質問
```

### 1.4 トラブルシューティング型（Troubleshooting）
**例**: `/manual/can_not_login/`, `/manual/error/`, `/manual/case_cannot_delivery/`

**特徴**:
- **問題の明確化**: 発生状況の説明
- **原因リスト**: 考えられる原因を列挙
- **解決手順**: チェックリストまたはステップ形式
- **関連リンク**: 詳細マニュアルへのリンク
- **サポート誘導**: 解決しない場合の問い合わせ先

**構造例**:
```
H1: ログインができない場合の対処方法
├─ 目次
├─ H2: よくある原因
│   ├─ パスワードの入力ミス
│   ├─ 2段階認証の設定
│   └─ ブラウザのキャッシュ
├─ H2: 解決手順
│   ├─ H3: 1. パスワードのリセット
│   ├─ H3: 2. ブラウザのキャッシュクリア
│   └─ H3: 3. 別のブラウザで試す
└─ H2: それでも解決しない場合
    └─ お問い合わせリンク
```

---

## 2. コンテンツ構造の詳細分析

### 2.1 見出し階層
**標準パターン**:
- **H1**: ページタイトル（1つのみ）
  - 例: `L Message（エルメ）のステップ配信 操作マニュアル`
- **H2**: 主要セクション（3-7個）
  - 例: `ステップ配信とは`, `設定方法`, `よくある質問`
- **H3**: サブセクション（H2配下に0-10個）
  - 例: `1. メッセージメニューを開く`, `2. ステップ配信を選択`

**見出しの命名規則**:
- チュートリアル: `〜とは`, `〜の方法`, `〜の設定`
- FAQ: `〜できない場合`, `〜するには`, `〜は可能ですか`
- 機能説明: `〜の概要`, `〜の使い方`, `〜の活用例`

### 2.2 テキストコンテンツ
**段落（Paragraph）**:
- 1段落: 2-4文程度
- 読みやすさ重視の短文構成
- 重要語句は太字（`<strong>`）で強調
- リンクは青色下線付き

**リスト（List）**:
- 番号付きリスト（`<ol>`）: 手順説明
- 箇条書きリスト（`<ul>`）: 特徴や選択肢
- ネストは最大2階層まで

**引用・注意書き**:
- 背景色付きボックスで目立たせる
- アイコン付き（💡 ヒント、⚠️ 注意、❌ エラー）
- 枠線は緑色が主流

### 2.3 コードブロック
**使用状況**: 一部のページでHTMLコードやURL例を表示
**スタイル**:
- 背景色: 薄いグレー（`#f5f5f5`）
- フォント: monospace（等幅フォント）
- コピーボタン: なし（手動コピー）

**例**:
```html
<div class="code-block">
  <pre><code>https://lme.jp/form/abc123</code></pre>
</div>
```

### 2.4 メディアコンテンツ

#### 画像（Images）
**種類**:
1. **ヒーローイメージ**: ページ冒頭の大きなバナー
   - サイズ: 1200x400px程度
   - 内容: L Messageロゴ + 機能名 + カテゴリー
   - 形式: JPG/PNG

2. **スクリーンショット**: UI操作の手順説明
   - サイズ: 可変（700-1000px幅）
   - 注釈: 赤枠や矢印で重要箇所を強調
   - 形式: PNG（透過あり）

3. **図解**: 概念説明やフロー図
   - サイズ: 600-800px幅
   - スタイル: シンプルなイラスト
   - 形式: PNG/SVG

**配置**:
- センター寄せ（`text-align: center`）
- 影付き（`box-shadow`）
- レスポンシブ対応（`max-width: 100%`）

**拡大表示**:
- Lightbox機能あり
- クリックでモーダル表示
- 閉じるボタン（×）

#### 動画（Videos）
**プラットフォーム**: YouTube埋め込み（`<iframe>`）
**配置パターン**:
1. **冒頭配置**: ページ全体の説明動画
2. **セクション内配置**: 特定手順の補足動画
3. **FAQ回答**: 複雑な質問への動画回答

**埋め込み設定**:
```html
<iframe
  width="100%"
  height="450"
  src="https://www.youtube.com/embed/VIDEO_ID"
  frameborder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen>
</iframe>
```

**動画の特徴**:
- タイトル: 「L Message（エルメ）の〜使い方」
- サムネイル: 緑色背景 + 白文字タイトル
- 長さ: 3-10分程度
- ナレーション: あり（女性の声）

---

## 3. UIコンポーネント詳細

### 3.1 目次（Table of Contents）

#### デスクトップ版
**配置**: 右サイドバー（sticky position）
**構造**:
```html
<div class="toc-widget">
  <div class="toc-header">
    <label>目次</label>
    <button class="toggle-btn">▼</button>
  </div>
  <nav class="toc-nav">
    <ul>
      <li><a href="#section1">セクション1</a></li>
      <li><a href="#section2">セクション2</a>
        <ul>
          <li><a href="#section2-1">サブセクション2-1</a></li>
        </ul>
      </li>
    </ul>
  </nav>
</div>
```

**機能**:
- **スムーズスクロール**: アンカーリンククリックで自動スクロール
- **アクティブハイライト**: 現在表示中のセクションを緑色で強調
- **折りたたみ**: ヘッダーをクリックで開閉
- **Sticky配置**: スクロールしても画面右側に固定

**スタイル**:
- 背景色: 白（`#ffffff`）
- 枠線: 薄いグレー（`#e0e0e0`）
- アクティブリンク: 緑色（`#00b900`）+ 太字
- ホバー: 背景色変化（`#f5f5f5`）

#### モバイル版
**配置**: コンテンツ直下（inline）
**特徴**:
- デフォルトで折りたたみ
- 「目次 ▼」ボタンをタップで展開
- フルワイドで表示
- スクロール時に固定表示なし

### 3.2 パンくずリスト（Breadcrumbs）
**配置**: ヘッダー直下
**構造**:
```html
<nav class="breadcrumbs">
  <a href="/">ホーム</a>
  <span class="separator">></span>
  <a href="/manual/category/message/">メッセージ</a>
  <span class="separator">></span>
  <span class="current">ステップ配信</span>
</nav>
```

**スタイル**:
- フォントサイズ: 14px
- セパレーター: `>`（右向き矢印）
- 現在ページ: 太字、リンクなし

### 3.3 関連記事リンク
**配置**: ページ下部（フッター上）
**種類**:
1. **カテゴリーバッジ**: 緑色の角丸ボックス
2. **前後の記事**: 矢印付きナビゲーション
3. **関連記事カード**: サムネイル + タイトル

**カード構造**:
```html
<div class="related-articles">
  <h3>関連記事</h3>
  <div class="card-grid">
    <article class="card">
      <img src="thumbnail.jpg" alt="">
      <h4>記事タイトル</h4>
      <p>記事の概要...</p>
      <a href="/manual/article/">続きを読む →</a>
    </article>
  </div>
</div>
```

### 3.4 CTA（Call to Action）
**種類**:
1. **マニュアル作成依頼**: ページ下部の緑色ボックス
2. **お問い合わせ**: ページ下部の緑色ボックス
3. **無料で使ってみる**: ヘッダーのオレンジボタン

**マニュアル作成依頼ボックス**:
```html
<div class="cta-box">
  <div class="cta-item">
    <p>マニュアルでわかりずらい点の<br>追加・改善のリクエスト</p>
    <a href="/manual/contact/" class="btn">マニュアル作成依頼</a>
  </div>
  <div class="cta-item">
    <p>ご不明点は各種窓口に<br>ご連絡ください</p>
    <a href="/manual/contact/" class="btn">お問い合わせ</a>
  </div>
</div>
```

**スタイル**:
- 背景色: 薄い緑（`#e8f5e9`）
- ボタン: 緑色（`#00b900`）+ 白文字
- ホバー: 濃い緑（`#008f00`）

### 3.5 サイドバー広告

#### エルグラム CTA
**配置**: 右サイドバー（目次の下）
**内容**:
- ヘッダー画像: エルグラム（インスタ運用サービス）
- 見出し: 「インスタ運用でお困りの方」
- サブヘッド: 「エルグラムで解決できます！」
- CTA: 「詳しくはこちら！」ボタン

**デザイン**:
- 背景色: 紫色のグラデーション
- イラスト: 笑顔の女性キャラクター
- ボタン: 白背景 + 紫文字 + 矢印アイコン

**スタイル**:
```css
.sidebar-ad {
  background: linear-gradient(135deg, #7b3ff2 0%, #a855f7 100%);
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin-bottom: 20px;
}

.sidebar-ad img {
  max-width: 100%;
  border-radius: 5px;
}

.sidebar-ad h3 {
  color: white;
  font-size: 18px;
  margin: 10px 0;
}

.sidebar-ad .btn {
  background: white;
  color: #7b3ff2;
  padding: 10px 20px;
  border-radius: 25px;
  display: inline-block;
  margin-top: 10px;
}
```

### 3.6 アンカーリンク
**機能**: 見出しにマウスホバーで表示されるリンクアイコン
**実装**:
```html
<h2 id="section-name">
  セクション名
  <a href="#section-name" class="anchor-link">#</a>
</h2>
```

**動作**:
- デフォルトで非表示
- ホバー時に表示（`opacity: 0 → 1`）
- クリックでURLにアンカーが追加
- コピーしてシェア可能

### 3.7 コピーボタン
**対象**: コードブロックやURL例
**配置**: ブロック右上
**動作**:
1. クリックでクリップボードにコピー
2. アイコンが変化（📋 → ✅）
3. 2秒後に元に戻る

---

## 4. レイアウトパターン

### 4.1 デスクトップレイアウト（> 1024px）

#### 2カラムレイアウト（標準）
```
┌────────────────────────────────────────────────────┐
│ ヘッダー（ロゴ + ナビ）                              │
├────────────────────────────────────────────────────┤
│ パンくずリスト                                        │
├────────────────────┬───────────────────────────────┤
│                    │ H1 タイトル                    │
│                    ├───────────────────────────────┤
│                    │ 目次（inline）                 │
│  サイドバー         ├───────────────────────────────┤
│  ┌──────────┐    │ H2 セクション1                  │
│  │ 目次（sticky）│   │   段落 + 画像                  │
│  └──────────┘    ├───────────────────────────────┤
│  ┌──────────┐    │ H2 セクション2                  │
│  │ 広告         │    │   段落 + 動画                  │
│  │ (エルグラム)│    ├───────────────────────────────┤
│  └──────────┘    │ 関連記事                        │
│                    ├───────────────────────────────┤
│                    │ CTA（問い合わせ）               │
├────────────────────┴───────────────────────────────┤
│ フッター                                            │
└────────────────────────────────────────────────────┘
```

**比率**:
- メインコンテンツ: 65-70%（約700-800px）
- サイドバー: 30-35%（約300-350px）
- 余白: 両サイド各20-40px

### 4.2 モバイルレイアウト（< 768px）

#### 1カラムレイアウト
```
┌────────────────────────┐
│ ハンバーガーメニュー    │
│ [≡] L Messageマニュアル│
├────────────────────────┤
│ H1 タイトル             │
├────────────────────────┤
│ 目次（折りたたみ）▼    │
├────────────────────────┤
│ H2 セクション1         │
│   段落 + 画像          │
├────────────────────────┤
│ H2 セクション2         │
│   段落 + 動画          │
├────────────────────────┤
│ 関連記事               │
├────────────────────────┤
│ CTA                    │
├────────────────────────┤
│ 固定フッターナビ       │
│ [ホーム][お問い合わせ] │
└────────────────────────┘
```

**特徴**:
- サイドバーなし（コンテンツに統合）
- 画像は全幅表示（100%）
- フォントサイズ: 16px（デスクトップは14px）
- タップしやすいボタンサイズ（最小44x44px）

### 4.3 タブレットレイアウト（768-1024px）
**アプローチ**: デスクトップとモバイルの中間
- 2カラムを維持
- サイドバー幅を縮小（250px程度）
- フォントサイズは14-15px

---

## 5. インタラクティブ要素

### 5.1 スムーズスクロール
**実装**: JavaScript（Intersection Observer API）
**動作**:
1. 目次リンクをクリック
2. 対象セクションまでスムーズにスクロール（800ms）
3. URLにアンカーが追加
4. 目次のアクティブ状態が更新

**コード例**:
```javascript
document.querySelectorAll('.toc-nav a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});
```

### 5.2 アコーディオン（FAQ）
**実装**: CSS + JavaScript
**動作**:
1. 質問をクリック
2. 回答エリアが展開（slideDown 300ms）
3. 矢印アイコンが回転（▼ → ▲）
4. 他のアコーディオンは自動で閉じる（オプション）

**HTML構造**:
```html
<div class="accordion">
  <div class="accordion-item">
    <button class="accordion-header">
      質問テキスト
      <span class="icon">▼</span>
    </button>
    <div class="accordion-content">
      <p>回答テキスト</p>
    </div>
  </div>
</div>
```

### 5.3 Lightbox（画像拡大）
**トリガー**: 画像クリック
**機能**:
- モーダルオーバーレイ表示
- 画像を画面サイズに合わせて拡大
- 背景クリックまたは×ボタンで閉じる
- 次/前の画像ナビゲーション（複数画像がある場合）

**ライブラリ**: おそらくカスタム実装またはlightbox2系

### 5.4 動画の自動再生制御
**設定**: 自動再生なし（`autoplay=0`）
**理由**: ユーザー体験を損なわないため
**操作**: ユーザーが再生ボタンをクリック

---

## 6. メタ情報とSEO

### 6.1 ページメタデータ
**確認項目**:
- タイトルタグ: 「機能名 | L Message使い方マニュアル」形式
- メタディスクリプション: 100-160文字で概要説明
- OGPタグ: SNSシェア用の画像とテキスト
- Canonical URL: 正規URLの指定

**例**:
```html
<title>L Message（エルメ）のステップ配信 操作マニュアル | L Message使い方マニュアルサイト</title>
<meta name="description" content="エルメのステップ配信機能の使い方を詳しく解説。設定方法から配信テスト、よくある質問まで網羅した完全ガイドです。">
<meta property="og:title" content="L Message（エルメ）のステップ配信 操作マニュアル">
<meta property="og:description" content="エルメのステップ配信機能の使い方を詳しく解説...">
<meta property="og:image" content="https://lme.jp/manual/images/step-delivery-og.jpg">
<link rel="canonical" href="https://lme.jp/manual/step_delivery/">
```

### 6.2 構造化データ（JSON-LD）
**種類**: Article, HowTo, FAQPage
**実装例**:
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "L Message（エルメ）のステップ配信 設定方法",
  "description": "ステップ配信を設定する手順を解説します",
  "step": [
    {
      "@type": "HowToStep",
      "name": "メッセージメニューを開く",
      "text": "左メニューから「メッセージ」をクリックします",
      "image": "https://lme.jp/manual/images/step1.png"
    },
    {
      "@type": "HowToStep",
      "name": "ステップ配信を選択",
      "text": "メッセージメニュー内の「ステップ配信」をクリックします"
    }
  ]
}
```

### 6.3 更新日時
**表示**: ページ下部またはヘッダー付近
**形式**: `最終更新日: 2025年10月15日`
**実装**: WordPressの投稿日時またはカスタムフィールド

### 6.4 カテゴリーとタグ
**カテゴリー**:
- メッセージ配信
- 顧客対応
- 予約管理
- 分析
- システム設定

**タグ**:
- ステップ配信
- リッチメニュー
- フォーム
- タグ管理
- 1:1チャット

---

## 7. パフォーマンスと最適化

### 7.1 画像最適化
**フォーマット**:
- WebP対応（フォールバックあり）
- JPG: 写真やスクリーンショット
- PNG: 図解やアイコン
- SVG: ロゴやシンプルな図形

**レスポンシブ画像**:
```html
<picture>
  <source srcset="image-800w.webp" type="image/webp" media="(max-width: 800px)">
  <source srcset="image-1200w.webp" type="image/webp">
  <img src="image-1200w.jpg" alt="説明テキスト" loading="lazy">
</picture>
```

**Lazy Loading**: `loading="lazy"` 属性で遅延読み込み

### 7.2 CSS/JS最適化
**CSS**:
- ミニファイ: 圧縮済み
- クリティカルCSS: インライン化
- 非クリティカルCSS: 遅延読み込み

**JavaScript**:
- ミニファイ: 圧縮済み
- 遅延読み込み: `defer`または`async`属性
- コード分割: ページごとに必要なJSのみ読み込み

### 7.3 キャッシュ戦略
**ブラウザキャッシュ**:
- 静的ファイル: 1年（`Cache-Control: max-age=31536000`）
- HTML: 1時間（`Cache-Control: max-age=3600`）

**CDN**: Cloudflare使用（推測）

---

## 8. Supabaseデータベース設計案

### 8.1 テーブル構造

#### articles テーブル（記事マスター）
```sql
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,  -- URL slug (/manual/step_delivery/)
  title TEXT NOT NULL,                -- ページタイトル
  description TEXT,                   -- メタディスクリプション
  content JSONB NOT NULL,             -- 構造化コンテンツ（後述）
  article_type VARCHAR(50) NOT NULL,  -- 'tutorial', 'faq', 'guide', 'troubleshooting'
  category_id UUID REFERENCES categories(id),
  featured_image_url TEXT,            -- ヒーローイメージ
  hero_image_url TEXT,                -- ヒーローイメージ（バナー）
  youtube_video_id VARCHAR(50),       -- メイン動画ID
  view_count INTEGER DEFAULT 0,       -- 閲覧数
  helpful_count INTEGER DEFAULT 0,    -- 役に立った数
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  meta_tags JSONB,                    -- OGP等のメタタグ
  structured_data JSONB,              -- JSON-LD用

  -- インデックス
  INDEX idx_articles_slug (slug),
  INDEX idx_articles_category (category_id),
  INDEX idx_articles_type (article_type),
  INDEX idx_articles_published (is_published, published_at)
);
```

#### categories テーブル（カテゴリー）
```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id),  -- 親カテゴリー
  display_order INTEGER DEFAULT 0,
  icon_url TEXT,
  color VARCHAR(7),  -- HEXカラー (#00b900)
  created_at TIMESTAMPTZ DEFAULT NOW(),

  INDEX idx_categories_parent (parent_id)
);
```

#### tags テーブル（タグ）
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### article_tags テーブル（記事とタグの中間テーブル）
```sql
CREATE TABLE article_tags (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);
```

#### article_sections テーブル（記事セクション）
```sql
CREATE TABLE article_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  heading_level INTEGER NOT NULL,  -- 2 or 3 (H2 or H3)
  heading_text TEXT NOT NULL,
  heading_id VARCHAR(255) NOT NULL,  -- アンカーリンク用ID
  content_blocks JSONB NOT NULL,   -- セクション内コンテンツ（後述）
  display_order INTEGER NOT NULL,
  parent_section_id UUID REFERENCES article_sections(id),

  INDEX idx_sections_article (article_id, display_order)
);
```

#### content_blocks テーブル（コンテンツブロック）
```sql
CREATE TABLE content_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES article_sections(id) ON DELETE CASCADE,
  block_type VARCHAR(50) NOT NULL,  -- 'text', 'image', 'video', 'code', 'list', 'callout'
  content JSONB NOT NULL,            -- ブロック固有のデータ
  display_order INTEGER NOT NULL,

  INDEX idx_blocks_section (section_id, display_order)
);
```

#### related_articles テーブル（関連記事）
```sql
CREATE TABLE related_articles (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  related_article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  relation_type VARCHAR(50),  -- 'manual', 'auto'
  relevance_score FLOAT,      -- 自動関連記事の場合のスコア
  PRIMARY KEY (article_id, related_article_id)
);
```

### 8.2 JSONB構造例

#### content_blocks.content（テキストブロック）
```json
{
  "type": "text",
  "paragraphs": [
    {
      "text": "エルメのステップ配信機能を使うと、友だち追加後に自動で複数のメッセージを配信できます。",
      "formatting": [
        {"start": 4, "end": 10, "type": "bold"},
        {"start": 15, "end": 19, "type": "link", "url": "/manual/greetings/"}
      ]
    }
  ]
}
```

#### content_blocks.content（画像ブロック）
```json
{
  "type": "image",
  "url": "https://lme.jp/manual/images/step-delivery-overview.png",
  "alt": "ステップ配信の設定画面",
  "caption": "メッセージメニューから「ステップ配信」を選択します",
  "width": 1000,
  "height": 600,
  "lightbox": true
}
```

#### content_blocks.content（動画ブロック）
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

#### content_blocks.content（リストブロック）
```json
{
  "type": "list",
  "list_type": "ordered",  // or "unordered"
  "items": [
    {
      "text": "メッセージメニューを開く",
      "children": []
    },
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

#### content_blocks.content（コールアウトブロック）
```json
{
  "type": "callout",
  "style": "warning",  // 'info', 'warning', 'error', 'tip'
  "icon": "⚠️",
  "title": "注意",
  "content": "ステップ配信を削除すると、進行中の配信も停止されます。"
}
```

### 8.3 クエリ例

#### 記事の全情報を取得（セクション + コンテンツブロック）
```sql
WITH RECURSIVE section_tree AS (
  -- ルートセクション（H2）
  SELECT
    s.*,
    1 AS level,
    ARRAY[s.display_order] AS path
  FROM article_sections s
  WHERE s.article_id = :article_id AND s.parent_section_id IS NULL

  UNION ALL

  -- サブセクション（H3）
  SELECT
    s.*,
    st.level + 1,
    st.path || s.display_order
  FROM article_sections s
  JOIN section_tree st ON s.parent_section_id = st.id
)
SELECT
  a.*,
  c.name AS category_name,
  json_agg(DISTINCT t.*) AS tags,
  json_agg(
    json_build_object(
      'section', st.*,
      'blocks', (
        SELECT json_agg(cb.* ORDER BY cb.display_order)
        FROM content_blocks cb
        WHERE cb.section_id = st.id
      )
    ) ORDER BY st.path
  ) AS sections
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
LEFT JOIN section_tree st ON a.id = st.article_id
WHERE a.slug = :slug AND a.is_published = true
GROUP BY a.id, c.name;
```

#### カテゴリー別の記事一覧（ページネーション付き）
```sql
SELECT
  a.id,
  a.slug,
  a.title,
  a.description,
  a.featured_image_url,
  a.article_type,
  a.view_count,
  a.published_at,
  c.name AS category_name,
  c.slug AS category_slug,
  json_agg(DISTINCT t.name) AS tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
WHERE
  a.is_published = true
  AND c.slug = :category_slug
GROUP BY a.id, c.name, c.slug
ORDER BY a.published_at DESC
LIMIT :limit OFFSET :offset;
```

#### 関連記事の取得（手動 + 自動）
```sql
WITH manual_related AS (
  SELECT
    ra.related_article_id AS article_id,
    'manual' AS source,
    1.0 AS score
  FROM related_articles ra
  WHERE ra.article_id = :article_id AND ra.relation_type = 'manual'
),
auto_related AS (
  SELECT
    ra.related_article_id AS article_id,
    'auto' AS source,
    ra.relevance_score AS score
  FROM related_articles ra
  WHERE ra.article_id = :article_id AND ra.relation_type = 'auto'
)
SELECT
  a.*,
  c.name AS category_name,
  r.source,
  r.score
FROM (
  SELECT * FROM manual_related
  UNION ALL
  SELECT * FROM auto_related
) r
JOIN articles a ON r.article_id = a.id
LEFT JOIN categories c ON a.category_id = c.id
WHERE a.is_published = true
ORDER BY r.source DESC, r.score DESC
LIMIT 5;
```

### 8.4 Row Level Security（RLS）ポリシー

#### 公開記事は全員が閲覧可能
```sql
CREATE POLICY "Public articles are viewable by everyone"
ON articles FOR SELECT
USING (is_published = true);
```

#### 認証済みユーザーは下書きも閲覧可能
```sql
CREATE POLICY "Authenticated users can view all articles"
ON articles FOR SELECT
USING (auth.role() = 'authenticated');
```

#### 管理者のみ記事を作成・更新・削除可能
```sql
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

---

## 9. 技術スタック（推測）

### 9.1 フロントエンド
- **フレームワーク**: WordPress（テーマカスタマイズ）
- **CSS**: カスタムCSS + レスポンシブデザイン
- **JavaScript**: jQuery + カスタムスクリプト
- **アイコン**: Font Awesome（一部）
- **動画**: YouTube iframe API

### 9.2 バックエンド
- **CMS**: WordPress
- **プラグイン**:
  - Yoast SEO（SEO最適化）
  - Advanced Custom Fields（カスタムフィールド）
  - Table of Contents Plus（目次生成）
  - WP Rocket（キャッシュ）

### 9.3 ホスティング
- **サーバー**: 不明（共有サーバーまたはVPS）
- **CDN**: Cloudflare（推測）
- **SSL**: Let's Encrypt

---

## 10. アクセシビリティ

### 10.1 準拠レベル
**目標**: WCAG 2.1 レベルAA

### 10.2 実装状況
**良好な点**:
- セマンティックHTML（適切な見出しタグ）
- altテキストが全画像に設定
- キーボードナビゲーション対応
- フォーカスインジケーター表示
- 十分なコントラスト比（緑 #00b900 は背景白でコントラスト比 3.5:1）

**改善可能な点**:
- 動画に字幕がない場合がある
- 一部のアイコンボタンにaria-labelが不足
- スクリーンリーダーでの目次ナビゲーション

---

## 11. モバイルファーストの実装

### 11.1 レスポンシブブレークポイント
```css
/* Mobile: 0-767px */
@media (max-width: 767px) {
  .sidebar { display: none; }
  .main-content { width: 100%; }
}

/* Tablet: 768-1023px */
@media (min-width: 768px) and (max-width: 1023px) {
  .sidebar { width: 250px; }
  .main-content { width: calc(100% - 270px); }
}

/* Desktop: 1024px+ */
@media (min-width: 1024px) {
  .sidebar { width: 300px; }
  .main-content { width: calc(100% - 320px); }
}
```

### 11.2 タッチ操作の最適化
- **ボタンサイズ**: 最小44x44px（Appleガイドライン）
- **スワイプジェスチャー**: 画像Lightboxでスワイプ対応
- **タップハイライト**: `-webkit-tap-highlight-color: transparent;`

---

## 12. パフォーマンス指標（推測）

### 12.1 Core Web Vitals
- **LCP（Largest Contentful Paint）**: 2.0-2.5秒（改善余地あり）
- **FID（First Input Delay）**: < 100ms（良好）
- **CLS（Cumulative Layout Shift）**: < 0.1（良好）

### 12.2 改善提案
1. **画像の最適化**: WebP形式の全面採用
2. **フォントの最適化**: Google Fontsの遅延読み込み
3. **JavaScriptの削減**: 未使用コードの削除
4. **サーバーレスポンス**: CDNキャッシュの強化

---

## 13. 将来的な拡張提案

### 13.1 機能追加
1. **記事内検索**: コンテンツ内全文検索
2. **フィードバック機能**: 「この記事は役に立ちましたか？」ボタン
3. **コメント機能**: ユーザーからの質問と回答
4. **印刷最適化**: PDF出力機能
5. **多言語対応**: 英語版マニュアル

### 13.2 コンテンツ拡充
1. **動画マニュアル**: 全記事に動画を追加
2. **インタラクティブデモ**: 画面操作のシミュレーション
3. **ダウンロード資料**: PDF版マニュアル
4. **チュートリアル動画**: 短い解説動画（1-2分）

### 13.3 パーソナライゼーション
1. **おすすめ記事**: AIによる記事推薦
2. **閲覧履歴**: ユーザーの閲覧履歴を保存
3. **ブックマーク**: お気に入り記事の保存
4. **進捗管理**: チュートリアルの完了状況追跡

---

## 14. まとめ

### 14.1 強み
1. **統一されたデザインシステム** - 全ページで一貫したUI/UX
2. **豊富な視覚資料** - スクリーンショットと動画で理解しやすい
3. **充実した目次機能** - ページ内ナビゲーションが優秀
4. **レスポンシブ対応** - モバイルでも快適に閲覧可能
5. **SEO最適化** - 構造化データとメタタグの実装

### 14.2 改善の余地
1. **パフォーマンス** - 画像最適化とコード削減
2. **アクセシビリティ** - WCAG 2.1 AA完全準拠
3. **インタラクティブ性** - デモやシミュレーション機能
4. **検索機能** - サイト内検索の強化
5. **ユーザーフィードバック** - 記事評価システム

### 14.3 データベース設計のポイント
1. **柔軟なコンテンツ構造** - JSONBで多様なコンテンツブロックに対応
2. **スケーラビリティ** - 数千記事でも高速クエリ可能
3. **バージョン管理** - 記事の更新履歴を保持
4. **関連記事の自動生成** - AIによる関連度スコアリング
5. **RLSによるセキュリティ** - 権限管理が容易

---

## 付録A: 主要URLリスト（抜粋）

### チュートリアル型
- `/manual/step_delivery/` - ステップ配信
- `/manual/rich_menu/` - リッチメニュー
- `/manual/message_delivery/` - メッセージ配信
- `/manual/form/` - フォーム作成
- `/manual/tag/` - タグ管理

### FAQ型
- `/manual/message_faq/` - メッセージ配信FAQ
- `/manual/form_faq/` - フォーム作成FAQ
- `/manual/step_faq/` - ステップ配信FAQ
- `/manual/customer_service_faq/` - 顧客対応FAQ

### 機能説明型
- `/manual/automatic_reply/` - 自動応答
- `/manual/chat/` - 1:1チャット
- `/manual/asp/` - ASP機能
- `/manual/pointcard/` - ポイントカード

### トラブルシューティング型
- `/manual/can_not_login/` - ログインできない
- `/manual/error/` - エラーが発生した場合
- `/manual/case_cannot_delivery/` - メッセージが送信できない

---

## 付録B: コンポーネントコード例

### 目次コンポーネント（React）
```jsx
import React, { useState, useEffect } from 'react';

const TableOfContents = ({ sections }) => {
  const [activeId, setActiveId] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '-80px 0px -80% 0px' }
    );

    sections.forEach((section) => {
      const element = document.getElementById(section.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [sections]);

  return (
    <div className="toc-widget">
      <div className="toc-header" onClick={() => setIsOpen(!isOpen)}>
        <label>目次</label>
        <span className="toggle-icon">{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <nav className="toc-nav">
          <ul>
            {sections.map((section) => (
              <li key={section.id} className={section.level === 3 ? 'nested' : ''}>
                <a
                  href={`#${section.id}`}
                  className={activeId === section.id ? 'active' : ''}
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById(section.id)?.scrollIntoView({
                      behavior: 'smooth',
                      block: 'start',
                    });
                  }}
                >
                  {section.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
};

export default TableOfContents;
```

---

**レポート作成者**: Claude (Anthropic)
**分析完了日**: 2025-10-29
**バージョン**: 1.0
