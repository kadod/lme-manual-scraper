# エルメ（L Message）全機能一覧

**作成日**: 2025-10-29
**分析対象**: L Messageマニュアルサイト 193ページ（カテゴリー50、記事122、その他21）
**目的**: マニュアルから逆算してエルメ本体の全機能を抽出

---

## エグゼクティブサマリー

L Message（エルメ）は、LINE公式アカウントの運用を自動化・効率化するSaaS製品です。マニュアル分析から抽出された機能は**9大カテゴリー、47サブカテゴリー、100+個別機能**に分類されます。

### 主要機能カテゴリー
1. **顧客対応** - チャット、自動応答、フォーム作成
2. **メッセージ配信** - ステップ配信、テンプレート、一斉配信
3. **情報管理** - タグ管理、友だち情報、QRコード
4. **予約管理** - イベント/レッスン/サロン予約
5. **販促ツール** - 商品販売、ポップアップ
6. **データ分析** - CSV、コンバージョン、クロス分析
7. **システム設定・契約** - アカウント管理、プラン管理
8. **その他システム** - スタッフ管理、システム設定
9. **有料プラン限定** - ASP、アカウント入れ替え、高度な機能

---

## 1. 顧客対応系機能

### 1.1 1:1チャット機能
**説明**: 友だちと個別にチャット対応できる機能
**主要機能**:
- リアルタイムチャット対応
- チャット履歴の確認
- 担当者振り分け
- チャット通知設定
- 対応状況管理（未対応/対応中/完了）
- メッセージテンプレート利用
- ファイル・画像送信
- スタンプ送信

**マニュアルページ**: /manual/category/customer_service/1on1/
**データベーステーブル案**:
```sql
chat_conversations (会話管理)
chat_messages (メッセージ履歴)
chat_assignments (担当者割り当て)
chat_templates (テンプレート)
```

---

### 1.2 スマホアプリ
**説明**: モバイルアプリからチャット対応
**主要機能**:
- プッシュ通知受信
- モバイルでのチャット対応
- オフライン時の自動応答設定
- アプリ内通知管理

**マニュアルページ**: /manual/category/customer_service/smartphone_apps/
**データベーステーブル案**:
```sql
mobile_devices (デバイス管理)
push_notifications (プッシュ通知)
```

---

### 1.3 リッチメニュー
**説明**: LINEトーク画面下部に表示されるメニュー作成
**主要機能**:
- リッチメニューのデザイン作成（テンプレート/カスタム）
- メニュー分割レイアウト（6分割、4分割、2分割など）
- アクション設定（URL、クーポン、テキスト、ショップカード等）
- 表示条件設定（友だち属性、タグ、期間）
- A/Bテスト機能
- 切り替えスケジュール設定
- デフォルトメニューと個別メニューの管理

**マニュアルページ**: /manual/category/customer_service/rich_menu/
**データベーステーブル案**:
```sql
rich_menus (リッチメニュー)
rich_menu_layouts (レイアウト設定)
rich_menu_actions (アクション設定)
rich_menu_conditions (表示条件)
rich_menu_schedules (スケジュール)
```

---

### 1.4 自動応答
**説明**: キーワードに応じて自動でメッセージを返信
**主要機能**:
- キーワードトリガー設定
- 完全一致/部分一致/正規表現
- マルチキーワード対応
- 除外キーワード設定
- 応答メッセージのカスタマイズ
- 応答時間帯の設定
- 優先順位設定
- AI応答機能（有料プラン）

**マニュアルページ**: /manual/category/customer_service/auto_answer/
**データベーステーブル案**:
```sql
auto_responses (自動応答ルール)
auto_response_keywords (キーワード)
auto_response_messages (応答メッセージ)
auto_response_conditions (条件設定)
```

---

### 1.5 フォーム作成
**説明**: アンケート、予約、申し込みフォームを作成
**主要機能**:
- ドラッグ&ドロップでフォーム作成
- 項目タイプ（テキスト、選択肢、日付、ファイルアップロード等）
- 条件分岐設定
- 必須項目設定
- バリデーション設定
- 回答データのCSVエクスポート
- 回答通知設定
- サンクスメッセージ設定
- フォーム埋め込みURL発行
- フォームデザインカスタマイズ

**マニュアルページ**: /manual/category/customer_service/form/
**データベーステーブル案**:
```sql
forms (フォーム)
form_fields (フォーム項目)
form_responses (回答データ)
form_conditions (条件分岐)
form_notifications (通知設定)
```

---

### 1.6 通知設定
**説明**: 各種イベント発生時の通知管理
**主要機能**:
- フォーム回答通知
- チャット通知
- 予約通知
- システムエラー通知
- 通知先設定（メール、LINE、チャット）
- 通知タイミング設定

**マニュアルページ**: /manual/category/customer_service/customer_support/
**データベーステーブル案**:
```sql
notification_settings (通知設定)
notification_logs (通知履歴)
```

---

## 2. メッセージ配信系機能

### 2.1 ステップ配信
**説明**: 友だち追加や特定アクション後に自動で複数メッセージを段階的に配信
**主要機能**:
- ステップシナリオ作成
- 配信タイミング設定（即時、○日後、○時間後）
- 配信条件設定（タグ、行動、属性）
- A/Bテスト機能
- 配信停止条件設定
- ステップ配信の一時停止/再開
- 配信結果の分析
- ステップ配信のテンプレート
- フォロワーに対する配信順序管理

**マニュアルページ**: /manual/category/message/step/
**データベーステーブル案**:
```sql
step_campaigns (ステップキャンペーン)
step_messages (ステップメッセージ)
step_conditions (配信条件)
step_schedules (配信スケジュール)
step_subscribers (配信対象者)
step_delivery_logs (配信履歴)
```

---

### 2.2 テンプレート
**説明**: よく使うメッセージをテンプレートとして保存
**主要機能**:
- テンプレート作成・編集
- カテゴリー分類
- テンプレート検索
- テンプレートの複製
- 動的変数の挿入（名前、日付等）
- メディアテンプレート（画像、動画）

**マニュアルページ**: /manual/category/message/template/
**データベーステーブル案**:
```sql
message_templates (テンプレート)
template_categories (カテゴリー)
template_variables (変数)
```

---

### 2.3 メッセージ配信
**説明**: 友だちに一斉メッセージを配信
**主要機能**:
- 一斉配信
- セグメント配信（タグ、属性、行動履歴）
- 配信予約
- 配信テスト
- 配信結果の確認（開封率、クリック率）
- リッチメッセージ作成
- カルーセル形式のメッセージ
- 画像・動画・音声・ファイル送信
- クーポン配信
- ショップカード配信

**マニュアルページ**: /manual/category/message/message_delivery/
**データベーステーブル案**:
```sql
message_campaigns (配信キャンペーン)
message_contents (メッセージ内容)
message_segments (セグメント)
message_schedules (配信予定)
message_delivery_logs (配信ログ)
message_analytics (配信分析)
```

---

### 2.4 メッセージ関連機能
**説明**: メッセージ配信に関連する補助機能
**主要機能**:
- 配信履歴の確認
- メッセージの複製
- メッセージの削除
- 配信エラーの確認
- 配信通数の管理

**マニュアルページ**: /manual/category/message/message_relation/
**データベーステーブル案**:
```sql
message_history (配信履歴)
message_errors (エラーログ)
```

---

### 2.5 あいさつメッセージ
**説明**: 友だち追加時に自動送信されるウェルカムメッセージ
**主要機能**:
- あいさつメッセージの作成
- 複数パターン設定
- 流入経路別の出し分け
- A/Bテスト
- 配信タイミング設定

**マニュアルページ**: /manual/category/message/greeting/
**データベーステーブル案**:
```sql
greeting_messages (あいさつメッセージ)
greeting_patterns (パターン)
greeting_conditions (出し分け条件)
```

---

## 3. 情報管理系機能

### 3.1 タグ管理
**説明**: 友だちにタグを付けてセグメント管理
**主要機能**:
- タグの作成・編集・削除
- タグの自動付与（フォーム回答、行動履歴）
- タグの手動付与
- タグの階層管理
- タグの検索・フィルタリング
- タグの一括操作
- タグベースのセグメント作成
- タグ付与/削除の条件設定

**マニュアルページ**: /manual/category/management/tag/
**データベーステーブル案**:
```sql
tags (タグ)
tag_categories (タグカテゴリー)
friend_tags (友だちタグ紐付け)
tag_rules (タグ自動付与ルール)
```

---

### 3.2 友だちリスト
**説明**: 友だちの一覧表示と管理
**主要機能**:
- 友だち一覧表示
- 検索・フィルタリング
- ソート機能
- 友だち情報の編集
- 友だちのブロック/削除
- 友だちのエクスポート（CSV）
- 友だちのインポート
- 友だちの統計情報表示

**マニュアルページ**: /manual/category/management/friends_list/
**データベーステーブル案**:
```sql
friends (友だち)
friend_profiles (プロフィール)
friend_statistics (統計情報)
```

---

### 3.3 友だち情報管理
**説明**: 友だちの詳細情報を管理
**主要機能**:
- カスタムフィールドの作成
- 友だち情報の表示
- 友だち情報の編集
- 行動履歴の確認
- タグ情報の確認
- メッセージ履歴の確認
- フォーム回答履歴の確認
- 購入履歴の確認

**マニュアルページ**: /manual/category/management/friends_information_management/
**データベーステーブル案**:
```sql
friend_custom_fields (カスタムフィールド)
friend_field_values (フィールド値)
friend_activities (行動履歴)
```

---

### 3.4 QRコードアクション
**説明**: 友だち追加用QRコードの発行と流入分析
**主要機能**:
- QRコードの発行
- QRコードごとのタグ自動付与
- 流入経路の分析
- QRコード別の友だち数集計
- QRコードの編集・削除
- 複数QRコードの管理

**マニュアルページ**: /manual/category/management/inflow/
**データベーステーブル案**:
```sql
qr_codes (QRコード)
qr_code_actions (アクション設定)
qr_code_analytics (流入分析)
```

---

## 4. 予約管理系機能

### 4.1 イベント予約
**説明**: セミナー、イベントの予約受付
**主要機能**:
- イベント作成
- 日時・場所設定
- 定員設定
- 予約フォーム作成
- 予約受付/キャンセル管理
- 予約確認メール送信
- 予約リマインド送信
- 参加者リスト管理
- 予約状況の確認

**マニュアルページ**: /manual/category/reserve/event/
**データベーステーブル案**:
```sql
events (イベント)
event_schedules (スケジュール)
event_reservations (予約)
event_participants (参加者)
```

---

### 4.2 レッスン予約
**説明**: 習い事、レッスンの予約受付
**主要機能**:
- レッスンメニュー作成
- 講師管理
- 時間枠設定
- 予約受付
- レッスン料金設定
- 予約確認通知
- リマインド通知
- キャンセル処理

**マニュアルページ**: /manual/category/reserve/lesson/
**データベーステーブル案**:
```sql
lessons (レッスン)
lesson_instructors (講師)
lesson_schedules (スケジュール)
lesson_reservations (予約)
```

---

### 4.3 サロン予約
**説明**: 美容室、サロンの予約受付
**主要機能**:
- メニュー作成
- スタッフ管理
- 時間枠設定
- 予約受付
- 料金設定
- 予約確認通知
- リマインド通知
- 顧客カルテ管理

**マニュアルページ**: /manual/category/reserve/salon/
**データベーステーブル案**:
```sql
salon_menus (メニュー)
salon_staff (スタッフ)
salon_schedules (スケジュール)
salon_reservations (予約)
salon_customer_records (カルテ)
```

---

### 4.4 リマインド
**説明**: 予約のリマインド通知を自動送信
**主要機能**:
- リマインドスケジュール設定（○日前、○時間前）
- リマインドメッセージのカスタマイズ
- リマインドの一時停止
- リマインド送信履歴
- リマインド失敗時の通知

**マニュアルページ**: /manual/category/reserve/remind/
**データベーステーブル案**:
```sql
reminder_settings (リマインド設定)
reminder_schedules (スケジュール)
reminder_logs (送信履歴)
```

---

### 4.5 予約関連機能
**説明**: 予約管理の補助機能
**主要機能**:
- 予約カレンダー表示
- 予約統計情報
- 予約のエクスポート
- 予約のキャンセル処理
- 予約の変更処理

**マニュアルページ**: /manual/category/reserve/reserve_relation/
**データベーステーブル案**:
```sql
reservation_calendar (カレンダー)
reservation_statistics (統計)
```

---

## 5. 販促ツール系機能

### 5.1 商品販売
**説明**: LINE上で商品を販売
**主要機能**:
- 商品登録
- 商品カテゴリー管理
- 価格設定
- 在庫管理
- 決済連携（UnivaPay、Stripe等）
- 注文管理
- 注文確認メール
- 配送管理
- 売上統計

**マニュアルページ**: /manual/category/promotion/settlement/
**データベーステーブル案**:
```sql
products (商品)
product_categories (カテゴリー)
product_inventory (在庫)
orders (注文)
order_items (注文明細)
payments (決済)
shipments (配送)
```

---

### 5.2 ポップアップ
**説明**: 友だちにポップアップメッセージを表示
**主要機能**:
- ポップアップ作成
- 表示条件設定（タグ、行動、期間）
- 表示回数制限
- ポップアップデザインのカスタマイズ
- CTAボタン設定
- 表示統計

**マニュアルページ**: /manual/category/promotion/pop_up/
**データベーステーブル案**:
```sql
popups (ポップアップ)
popup_conditions (表示条件)
popup_displays (表示履歴)
```

---

## 6. データ分析系機能

### 6.1 CSV管理
**説明**: 各種データのCSVエクスポート/インポート
**主要機能**:
- 友だちデータのエクスポート
- タグデータのエクスポート
- フォーム回答のエクスポート
- 予約データのエクスポート
- 注文データのエクスポート
- 友だちデータのインポート
- タグの一括付与（CSV）

**マニュアルページ**: /manual/category/analysis/csv/
**データベーステーブル案**:
```sql
csv_exports (エクスポート履歴)
csv_imports (インポート履歴)
csv_templates (テンプレート)
```

---

### 6.2 コンバージョン
**説明**: コンバージョン目標の設定と計測
**主要機能**:
- コンバージョン目標の設定
- コンバージョン計測
- コンバージョン率の表示
- ファネル分析
- コンバージョン経路の分析
- A/Bテスト結果の比較

**マニュアルページ**: /manual/category/analysis/conversion/
**データベーステーブル案**:
```sql
conversion_goals (コンバージョン目標)
conversion_events (コンバージョンイベント)
conversion_funnels (ファネル)
conversion_analytics (分析データ)
```

---

### 6.3 クロス分析
**説明**: 複数のデータをクロス集計して分析
**主要機能**:
- 属性別のクロス分析
- 行動別のクロス分析
- タグ別のクロス分析
- 期間指定での比較
- グラフ表示（円グラフ、棒グラフ）
- 分析結果のエクスポート

**マニュアルページ**: /manual/category/analysis/cross/
**データベーステーブル案**:
```sql
cross_analysis_reports (クロス分析レポート)
cross_analysis_dimensions (分析軸)
```

---

### 6.4 URL分析
**説明**: メッセージ内URLのクリック計測
**主要機能**:
- トラッキングURLの発行
- クリック数の計測
- クリック率の表示
- 友だち別のクリック履歴
- URL別の統計情報
- リファラー分析

**マニュアルページ**: /manual/category/analysis/url/
**データベーステーブル案**:
```sql
tracking_urls (トラッキングURL)
url_clicks (クリック履歴)
url_analytics (URL分析)
```

---

## 7. システム設定・契約系機能

### 7.1 新規接続
**説明**: LINE公式アカウントとエルメの連携
**主要機能**:
- LINE公式アカウント連携
- チャネルアクセストークン設定
- Webhook設定
- 連携テスト
- 連携状態の確認

**マニュアルページ**: /manual/category/system_contract/新規接続/
**データベーステーブル案**:
```sql
line_accounts (LINE公式アカウント)
line_credentials (認証情報)
line_webhooks (Webhook設定)
```

---

### 7.2 エルメアカウント
**説明**: エルメのアカウント管理
**主要機能**:
- アカウント情報の編集
- パスワード変更
- メールアドレス変更
- アカウント削除
- ログイン履歴の確認
- セキュリティ設定

**マニュアルページ**: /manual/category/system_contract/lmessage/
**データベーステーブル案**:
```sql
users (ユーザー)
user_profiles (プロフィール)
user_sessions (セッション)
user_security_settings (セキュリティ設定)
```

---

### 7.3 有料プラン
**説明**: 有料プランへのアップグレード管理
**主要機能**:
- プラン選択
- 支払い情報登録
- プラン変更
- 支払い履歴の確認
- 請求書発行
- プランのキャンセル

**マニュアルページ**: /manual/category/system_contract/paid_plan/
**データベーステーブル案**:
```sql
subscription_plans (プラン)
subscriptions (契約)
payments (支払い)
invoices (請求書)
```

---

## 8. その他システム関連機能

### 8.1 スタッフ管理
**説明**: 複数スタッフでの運用管理
**主要機能**:
- スタッフアカウント作成
- 権限設定（管理者、オペレーター、閲覧者）
- スタッフの追加・削除
- スタッフ別のチャット割り当て
- スタッフ別の操作履歴

**マニュアルページ**: /manual/category/other_system/staff/
**データベーステーブル案**:
```sql
staff_members (スタッフ)
staff_roles (役割)
staff_permissions (権限)
staff_activity_logs (操作履歴)
```

---

### 8.2 その他システム関連
**説明**: システム全般の設定
**主要機能**:
- 通知設定
- タイムゾーン設定
- 言語設定
- API設定
- Webhook設定
- ログ確認

**マニュアルページ**: /manual/category/other_system/system/
**データベーステーブル案**:
```sql
system_settings (システム設定)
api_keys (APIキー)
webhooks (Webhook)
system_logs (システムログ)
```

---

## 9. 有料プラン限定機能

### 9.1 ASP管理
**説明**: 代理店向けの管理機能
**主要機能**:
- 複数アカウントの一括管理
- クライアントアカウント作成
- クライアントデータの確認
- 一括操作
- レポート機能

**マニュアルページ**: /manual/category/paid/asp/
**データベーステーブル案**:
```sql
asp_accounts (ASPアカウント)
asp_clients (クライアント)
asp_operations (一括操作)
```

---

### 9.2 LINE公式アカウント入れ替え
**説明**: 連携するLINE公式アカウントの変更
**主要機能**:
- アカウント入れ替え
- データ移行
- 入れ替え履歴の確認

**マニュアルページ**: /manual/category/paid/loa_change/
**データベーステーブル案**:
```sql
account_migrations (アカウント移行)
migration_logs (移行ログ)
```

---

### 9.3 アクションスケジュール実行
**説明**: 複雑なアクションを時間指定で自動実行
**主要機能**:
- スケジュール設定
- アクションの組み合わせ
- 実行条件設定
- 実行履歴の確認
- エラーログの確認

**マニュアルページ**: /manual/category/paid/action_schedule/
**データベーステーブル案**:
```sql
scheduled_actions (スケジュールアクション)
action_executions (実行履歴)
```

---

### 9.4 データコピー
**説明**: 設定やデータを別アカウントにコピー
**主要機能**:
- テンプレートのコピー
- ステップ配信のコピー
- リッチメニューのコピー
- フォームのコピー
- タグのコピー

**マニュアルページ**: /manual/category/paid/data_copy/
**データベーステーブル案**:
```sql
data_copies (データコピー)
copy_logs (コピーログ)
```

---

## 10. LINE公式アカウント機能（連携機能）

### 10.1 LINE公式アカウント基本機能
**説明**: LINE公式アカウントの標準機能をエルメから利用
**主要機能**:
- プロフィール設定
- 応答設定
- クーポン発行
- ショップカード
- リサーチ機能
- タイムライン投稿

**マニュアルページ**: /manual/category/loa/
**データベーステーブル案**:
```sql
line_profile_settings (プロフィール設定)
line_coupons (クーポン)
line_shop_cards (ショップカード)
```

---

## 全機能マップ

### 機能カテゴリー別集計

| カテゴリー | サブカテゴリー数 | 主要機能数 |
|-----------|----------------|-----------|
| 顧客対応 | 6 | 30+ |
| メッセージ配信 | 5 | 25+ |
| 情報管理 | 4 | 20+ |
| 予約管理 | 5 | 25+ |
| 販促ツール | 2 | 10+ |
| データ分析 | 4 | 15+ |
| システム設定・契約 | 3 | 12+ |
| その他システム | 2 | 8+ |
| 有料プラン限定 | 4 | 12+ |
| LINE連携 | 1 | 6+ |
| **合計** | **36** | **163** |

---

## データベース設計統合案

### 主要テーブル一覧（抜粋）

```sql
-- ユーザー・アカウント系
users (ユーザー)
line_accounts (LINE公式アカウント)
subscriptions (契約)
staff_members (スタッフ)

-- 友だち管理系
friends (友だち)
friend_profiles (プロフィール)
tags (タグ)
friend_tags (友だちタグ紐付け)

-- メッセージ配信系
message_campaigns (配信キャンペーン)
step_campaigns (ステップキャンペーン)
message_templates (テンプレート)
rich_menus (リッチメニュー)

-- チャット系
chat_conversations (会話)
chat_messages (メッセージ)
auto_responses (自動応答)

-- フォーム系
forms (フォーム)
form_fields (フォーム項目)
form_responses (回答)

-- 予約系
events (イベント)
lessons (レッスン)
salon_reservations (サロン予約)
reminder_settings (リマインド設定)

-- 販促系
products (商品)
orders (注文)
popups (ポップアップ)

-- 分析系
conversion_goals (コンバージョン目標)
tracking_urls (トラッキングURL)
url_clicks (クリック履歴)

-- システム系
system_settings (システム設定)
api_keys (APIキー)
webhooks (Webhook)
system_logs (ログ)
```

---

## 機能の優先順位（実装時）

### Phase 1: コア機能（MVP）
1. LINE公式アカウント連携
2. 友だち管理（基本情報、タグ）
3. メッセージ配信（一斉配信）
4. 1:1チャット
5. フォーム作成

### Phase 2: 自動化機能
1. ステップ配信
2. 自動応答
3. リッチメニュー
4. あいさつメッセージ

### Phase 3: 予約・販促機能
1. 予約管理（イベント、レッスン、サロン）
2. リマインド
3. 商品販売
4. ポップアップ

### Phase 4: 分析機能
1. URL分析
2. コンバージョン分析
3. クロス分析
4. CSV管理

### Phase 5: 高度な機能
1. ASP管理
2. アクションスケジュール実行
3. データコピー
4. LINE公式アカウント入れ替え

---

## まとめ

### エルメの特徴的な機能

1. **ステップ配信** - 友だち追加後の自動シナリオ
2. **リッチメニュー** - 条件分岐とスケジュール管理
3. **フォーム作成** - ノーコードで複雑なフォーム構築
4. **予約管理** - イベント/レッスン/サロンに対応
5. **タグ管理** - 柔軟なセグメント管理
6. **データ分析** - URL、コンバージョン、クロス分析
7. **自動応答** - キーワードトリガーとAI応答
8. **商品販売** - 決済連携と在庫管理

### 競合優位性

- LINE公式アカウントの完全活用
- マーケティングオートメーション機能
- 予約管理の充実
- 詳細な分析機能
- ASP向けの管理機能

---

**作成者**: Claude (Anthropic)
**最終更新**: 2025-10-29
**バージョン**: 1.0
