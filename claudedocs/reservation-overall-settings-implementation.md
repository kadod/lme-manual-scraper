# Reservation Overall Settings Implementation

## Overview
Created a comprehensive "全体設定" (Overall Settings) component for the reservation detail page with a sidebar navigation and multiple content sections.

## Files Created

### 1. Component: `/components/reservations/ReservationOverallSettings.tsx`
Main component with all functionality including:
- Left sidebar with menu items
- Content sections for each menu item
- State management for all settings

### 2. Page: `/app/dashboard/reservations/overall-settings/page.tsx`
Demo page to showcase the component

## Features Implemented

### Left Sidebar Navigation
- **14 menu items** with proper hierarchy
- Active state highlighting (green for selected highlighted items)
- Collapsible "その他" (Other) section
- Indented child items
- Link icon for integration settings

### Menu Items
1. メッセージ・予約の各種設定
2. **予約・キャンセルのメッセージ・リクエストと締切** (highlighted by default)
3. 予約前後に送るリマインドメッセージ
4. 空き枠通知受け取り設定
5. 予約画面
6. お客様への質問項目
7. 予約ページの表示設定
8. トップ画面設定
9. 店舗・ビジネス情報
10. 利用規約
11. 連携設定 (with link icon)
12. Googleスプレッドシート連携 (indented)
13. その他 (collapsible section)
14. 予約システムの削除 (indented, destructive)

### Content Sections

#### 1. 予約・キャンセルのメッセージ・リクエストと締切 (Default View)
- Two side-by-side cards (予約時 and キャンセル時)
- Green checkmark icon for booking, red X icon for cancellation
- Tabs: メッセージ, アクション, 各種設定
- Message preview with template variables
- Green "予約時の設定をする" button
- Red "キャンセル時の設定をする" button

#### 2. 予約前後に送るリマインドメッセージ
- Blue section: "コース開始前のメッセージ・アクション"
- "+ 送信タイミングを追加する" button
- Timing badges (e.g., "コース開始 1日前の 10時00分")
- Red section: "コース終了後のメッセージ・アクション"
- Empty state for no configured timings

#### 3. 空き枠通知受け取り設定
- Toggle switch (停止中/受付中)
- "変更履歴" link
- Visual flow diagram with icons
- Calendar and notification illustrations
- Explanation text

#### 4. お客様への質問項目
- Action buttons: 短文回答, 長文回答, 単一選択, 複数選択, 日時
- System fields with drag handles
- Required/Optional badges
- Edit buttons for each field

#### 5. 予約ページの表示設定
- Three sections with radio groups:
  - コース料金の表示 (with preview)
  - 残り枠数の表示
  - 満席コースの表示
- Preview and Save buttons

#### 6. トップ画面設定
- Display toggle radio group
- Image upload area (with recommended size)
- Shop name input
- Rich text editor with toolbar (bold, italic, link)
- Preview and Save buttons

#### 7. 店舗・ビジネス情報
- Image upload section
- Rich text editor with extended toolbar
- Preview and Save buttons

#### 8. 利用規約の設定
- Toggle switch (表示しない/表示する)
- Conditional textarea for terms content
- Save button

#### 9. Googleスプレッドシート連携
- Warning card (yellow theme)
- "Googleアカウント連携が完了していません" message
- "Sign in with Google" button with Google logo

#### 10. 予約システムの削除
- Red warning card
- Danger explanation with bullet points
- Confirmation input field
- Red delete button with trash icon
- Warning about email confirmation

## Design Features

### Color Scheme
- Primary green: `#10b981` (green-600)
- Destructive red for cancellation and deletion
- Blue for reminder sections
- Yellow for warnings
- Muted backgrounds for cards

### UI Components Used
- Card, CardHeader, CardTitle, CardContent, CardDescription
- Button (with variants: default, outline, destructive)
- Input, Textarea, Label
- Switch, RadioGroup
- Tabs (for booking/cancellation messages)
- Badge (for required/optional fields)
- ScrollArea (for sidebar)
- Icons from Heroicons

### Responsive Design
- Fixed-width sidebar (320px)
- Flexible main content area
- Scrollable content sections
- Grid layouts for two-column cards

### Interaction States
- Active menu highlighting
- Hover states for menu items
- Tab switching
- Toggle switches
- Collapsible sections

## Usage Example

```tsx
import { ReservationOverallSettings } from '@/components/reservations/ReservationOverallSettings'

export default function Page() {
  return (
    <div className="h-[calc(100vh-4rem)]">
      <ReservationOverallSettings
        reservationId="reservation-123"
        reservationName="無料相談"
      />
    </div>
  )
}
```

## Access
Navigate to: `/dashboard/reservations/overall-settings`

## Next Steps (Optional Enhancements)
1. Add server actions for saving settings
2. Implement actual Google Sheets integration
3. Add form validation
4. Connect to backend API
5. Add image upload functionality
6. Implement rich text editor with TipTap or similar
7. Add drag-and-drop reordering for question items
8. Add preview modal for reservation page
9. Add change history functionality
10. Implement actual deletion flow with confirmation email

## Technical Notes
- Component is fully client-side ('use client')
- Uses React hooks for state management
- All sections are self-contained within the component
- Green theme (#10b981) used consistently for primary actions
- Professional icon usage (no emojis) per project guidelines
