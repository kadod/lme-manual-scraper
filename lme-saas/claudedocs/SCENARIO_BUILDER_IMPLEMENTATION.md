# シナリオ応答ビルダー実装完了

## 概要
自動応答のシナリオビルダー機能が完全に実装されています。React Flowを使用したビジュアルフローエディターにより、ドラッグ&ドロップで直感的にシナリオを作成できます。

## 実装済みファイル

### ページコンポーネント
- `/app/dashboard/auto-response/scenario/new/page.tsx` - 新規シナリオ作成画面
- `/app/dashboard/auto-response/scenario/[id]/edit/page.tsx` - シナリオ編集画面

### コアコンポーネント
- `/components/auto-response/ScenarioFlowEditor.tsx` - React Flowベースのビジュアルエディター
- `/components/auto-response/ScenarioSimulator.tsx` - シナリオテストシミュレーター
- `/components/auto-response/NodeEditorDialog.tsx` - ノード編集ダイアログ

### ノードコンポーネント
- `/components/auto-response/nodes/StartNode.tsx` - 開始ノード
- `/components/auto-response/nodes/MessageNode.tsx` - メッセージ送信ノード
- `/components/auto-response/nodes/QuestionNode.tsx` - ユーザー質問ノード
- `/components/auto-response/nodes/BranchNode.tsx` - 条件分岐ノード
- `/components/auto-response/nodes/ActionNode.tsx` - アクション実行ノード
- `/components/auto-response/nodes/EndNode.tsx` - 終了ノード

### 型定義
- `/types/scenario.ts` - シナリオ関連の型定義

## 機能詳細

### 基本設定
- シナリオ名
- 説明
- 開始キーワード
- タイムアウト時間（分）

### ビジュアルフローエディター
#### React Flow統合
- カスタムノードタイプ:
  - **スタートノード**: 開始地点（緑色）
  - **メッセージノード**: テキスト送信（青色）
  - **質問ノード**: ユーザー入力待ち（紫色）
  - **分岐ノード**: 条件分岐（オレンジ色）
  - **アクションノード**: タグ付与、セグメント移動（インディゴ色）
  - **エンドノード**: 終了地点（赤色）
- ドラッグ&ドロップでノード配置
- エッジ（矢印）で接続
- 自動レイアウト調整
- ミニマップとコントロール表示

### ノード編集機能

#### メッセージノード
- テキスト入力
- リッチメッセージID選択（オプション）
- 遅延時間設定（秒）

#### 質問ノード
- 質問文入力
- 回答タイプ選択:
  - 自由入力
  - 単一選択
  - 複数選択
- 選択肢設定（複数登録・削除可能）
- タイムアウト時間（分）
- タイムアウト動作（終了/続行）

#### 分岐ノード
- 分岐条件設定:
  - キーワードマッチ
  - 数値範囲
  - カスタムフィールド値
- 複数分岐対応
- デフォルト分岐設定

#### アクションノード
- アクションタイプ選択:
  - タグ追加
  - タグ削除
  - セグメント追加
  - セグメント削除
  - フィールド更新
  - ステップ配信開始
- 複数アクション追加・削除可能

### シナリオシミュレーター
- シナリオフロー全体表示
- 対話形式のテスト実行
- ステップごとの動作確認
- ボット・ユーザーメッセージの区別表示
- リセット機能

### タブ切り替え
- フローエディタータブ
- シミュレータータブ

## 技術スタック

### 依存ライブラリ
- **reactflow**: v11.11.4 - ビジュアルフローエディター
- **@heroicons/react**: v2.2.0 - アイコン（emoji不使用）
- **shadcn/ui**: Card, Button, Input, Select, Dialog, Tabs

### React Flowの設定
- カスタムNodeTypes定義
- useNodesState / useEdgesStateフック使用
- Background, Controls, MiniMap統合
- Panel UIでノード追加メニュー

## 今後の拡張予定

### Phase 7以降
1. データベース統合（Supabase）
2. シナリオCRUD API実装
3. 条件分岐の詳細設定UI
4. アクションの詳細パラメータ設定
5. シナリオ実行エンジン
6. 統計・分析機能

## 使用方法

1. **新規作成**: `/dashboard/auto-response/scenario/new` にアクセス
2. **基本設定**: シナリオ名、説明、キーワード、タイムアウトを入力
3. **フロー作成**:
   - 左側パネルからノードを追加
   - ノードをドラッグして配置
   - ノードをクリックして編集
   - ノード間を接続してフロー作成
4. **テスト**: シミュレータータブで動作確認
5. **保存**: 保存ボタンでシナリオ保存（現在はモックデータ）

## 注意事項
- 現在API連携は未実装（TODO コメント記載）
- データはローカルステートで管理
- 実際の保存・読み込みは次フェーズで実装予定
