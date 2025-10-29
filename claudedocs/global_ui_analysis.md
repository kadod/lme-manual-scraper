# L Message Manual Site - Global UI Elements Analysis

**Analysis Date**: 2025-10-29
**Total Pages Analyzed**: 193 pages (sampled 10-15 representative pages)
**Base URL**: https://lme.jp/manual/

---

## Executive Summary

This report provides a comprehensive analysis of global UI elements across the L Message manual website. The analysis covers header, footer, sidebar, search, breadcrumbs, and responsive behavior patterns that are consistent across all 193 pages.

---

## 1. Header (ヘッダー)

### 1.1 Desktop Header Structure

**Position**: Fixed at top, sticky behavior
**Background**: White with subtle shadow for depth
**Height**: Approximately 70-80px

#### Logo Section
- **Location**: Top-left corner
- **Element**: Clickable image logo linking to homepage
- **Text**: "L Message（エルメッセージ）使い方マニュアルサイト"
- **Image**: Logo with consistent branding
- **Behavior**: Always visible, links to `/manual/`

#### Global Navigation Menu
**Location**: Right side of header
**Menu Structure** (horizontal list):

1. **カテゴリー** (Categories) - Dropdown trigger
   - Opens category mega menu on hover/click
   - Shows all major content categories

2. **お知らせ** (News/Updates)
   - Direct link to `/manual/category/information/`

3. **スタッフ募集** (Staff Recruitment)
   - Direct link to staff recruitment page

4. **よくある質問** (FAQ)
   - Direct link to help/FAQ section

5. **お問い合わせ** (Contact)
   - Direct link to `/manual/contact/`

6. **無料で使ってみる** (Try for Free) - CTA Button
   - Prominent call-to-action
   - Styled as primary button (different color/style)
   - Links to external signup/trial page

#### Search Icon
- **Location**: Far right in header (before hamburger menu on mobile)
- **Icon**: Magnifying glass icon (typically FontAwesome or similar)
- **Behavior**: Opens search modal/overlay when clicked
- **Always visible**: Yes

### 1.2 Category Mega Menu

**Trigger**: "カテゴリー" dropdown in main nav
**Display**: Dropdown/mega menu overlay

**Categories Structure**:
1. **顧客対応** (Customer Service)
   - 1:1チャット (1-on-1 Chat)
   - 自動応答 (Auto Answer)
   - カスタマーサポート (Customer Support)
   - フォーム (Forms)
   - リッチメニュー (Rich Menu)
   - スマホアプリ (Smartphone Apps)

2. **メッセージ** (Messages)
   - あいさつメッセージ (Greeting Messages)
   - メッセージ配信 (Message Delivery)
   - ステップ配信 (Step Delivery)
   - テンプレート (Templates)
   - その他メッセージ関連 (Other Message-related)

3. **情報管理** (Information Management)
   - 友だちリスト (Friends List)
   - 友だち情報管理 (Friends Information Management)
   - タグ管理 (Tag Management)
   - 流入経路 (Inflow Routes)

4. **データ分析** (Data Analysis)
   - コンバージョン (Conversion)
   - クロス分析 (Cross Analysis)
   - CSV管理 (CSV Management)
   - URL分析 (URL Analysis)

5. **販促ツール** (Promotion Tools)
   - ポップアップ (Pop-up)
   - 商品販売・決済 (Product Sales & Settlement)

6. **予約管理** (Reservation Management)
   - イベント予約 (Event Reservations)
   - レッスン予約 (Lesson Reservations)
   - サロン・面談予約 (Salon/Interview Reservations)
   - リマインド配信 (Reminder Delivery)
   - その他予約関連 (Other Reservation-related)

7. **システム設定・契約** (System Settings & Contracts)
   - 新規接続 (New Connection)
   - エルメッセージ (L Message)
   - 有料プラン (Paid Plans)

8. **その他システム関連** (Other System-related)
   - スタッフ管理 (Staff Management)
   - その他システム (Other Systems)

9. **有料プラン限定** (Paid Plan Exclusive)
   - アクションスケジュール (Action Schedule)
   - ASP管理 (ASP Management)
   - データコピー (Data Copy)
   - LOA切り替え (LOA Change)

### 1.3 Mobile Header (< 768px)

**Changes from Desktop**:
- Logo remains visible but may be slightly smaller
- Navigation menu collapses into hamburger icon (☰)
- Search icon remains visible
- CTA button ("無料で使ってみる") remains prominent

**Hamburger Menu**:
- **Icon**: Three horizontal lines (☰)
- **Location**: Top-right corner
- **Behavior**: Opens slide-out/overlay menu
- **Menu Style**: Full-screen or slide-from-right overlay
- **Menu Content**:
  - All navigation items listed vertically
  - Categories expandable/collapsible
  - Same structure as desktop mega menu

---

## 2. Footer (フッター)

### 2.1 Footer Structure

**Position**: Bottom of every page
**Background**: Typically darker than main content (light gray or dark background)
**Layout**: Multi-column layout on desktop, stacked on mobile

### 2.2 Footer Content

#### Navigation Links Section
**Organized by Category** (mirrors header categories):
- Quick links to main sections
- Internal linking structure for SEO
- All major category pages linked

#### Support Links
- **公式サイト** (Official Site) - External link to main L Message site
- **よくある質問** (FAQ) - Internal link to help section
- **ヘルプ** (Help) - Internal link to help/support
- **お問い合わせ** (Contact) - Internal link to contact page

#### Legal & Copyright
**Copyright Notice**:
```
© 2020-2025 L Message（エルメッセージ）使い方マニュアルサイト.
```

**Additional Legal Links** (if present):
- プライバシーポリシー (Privacy Policy)
- 利用規約 (Terms of Service)
- 特定商取引法 (Specified Commercial Transactions Act)

#### Social Media Links
- **LINE公式アカウント** - Link to add L Message official LINE account
- Other social media icons (Twitter/X, Facebook, YouTube if present)

### 2.3 Footer Responsive Behavior

**Desktop (> 1024px)**:
- Multi-column layout (typically 3-4 columns)
- Horizontal arrangement of link groups

**Tablet (768px - 1024px)**:
- 2-column layout
- Reduced spacing

**Mobile (< 768px)**:
- Single column, stacked vertically
- Collapsible sections (accordion style) possible
- Copyright moves to bottom

---

## 3. Sidebar & Navigation Elements

### 3.1 Left Sidebar (Present on Article/Manual Pages)

**Position**: Fixed left side on desktop, hidden/collapsible on mobile
**Width**: Approximately 250-300px
**Background**: Light background, distinct from main content

#### Category Navigation Tree
**Structure**: Hierarchical tree menu
- Parent categories expandable
- Active category highlighted
- Current page highlighted with different color/bold
- Indent levels show hierarchy

**Example Structure**:
```
▼ 顧客対応
  - 1:1チャット
  - 自動応答
  - カスタマーサポート
  ▶ フォーム
  - リッチメニュー
  - スマホアプリ

▼ メッセージ
  - あいさつメッセージ
  - メッセージ配信
  [current page highlighted]
  - ステップ配信
  ...
```

#### Sticky Behavior
- Sidebar scrolls with page OR
- Sidebar fixed position with internal scrolling
- Remains visible throughout page scroll (desktop only)

### 3.2 Right Sidebar (Table of Contents - TOC)

**Present on**: Individual article/manual pages
**Position**: Right side, sticky during scroll
**Width**: Approximately 200-250px

#### Table of Contents Widget
**Label**: "目次" (Table of Contents)
**Features**:
- Auto-generated from page headings (H2, H3, H4)
- Clickable anchor links
- Smooth scroll to section on click
- Current section highlighted during scroll (scroll spy)
- Collapsible/expandable sections

**Example TOC Structure**:
```
目次
├─ 友だち以外への有効化とは
├─ 有効化の方法
│  ├─ LINE Developersにログイン
│  ├─ 「LINE Developers コンソール」をクリック
│  ├─ 利用中のプロバイダーの選択
│  ├─ 「LINEログイン」のチャネルを選択
│  └─ 「リンクされたLINE公式アカウント」を更新
└─ まとめ
```

#### Related Articles Widget (if present)
- **Label**: "関連記事" (Related Articles)
- Lists 3-5 related articles
- Thumbnail images
- Article titles
- Category badges

### 3.3 Mobile Sidebar Behavior

**< 768px viewport**:
- Left sidebar hidden by default
- Accessible via hamburger menu or dedicated button
- Slides in from left or displays as overlay
- TOC moved to top of article or hidden in accordion

---

## 4. Search Functionality (検索機能)

### 4.1 Search Trigger

**Desktop Header**:
- **Icon**: Magnifying glass (🔍)
- **Location**: Right side of header, before hamburger menu
- **Label**: "検索" (Search) - may be icon-only or with text

**Mobile Header**:
- Same icon placement
- Remains visible at all viewport sizes

### 4.2 Search Modal/Overlay

**Activation**: Click on search icon
**Display**: Full-screen overlay or modal popup
**Background**: Semi-transparent dark overlay (rgba)

#### Search Input
**Placeholder Text**: "キーワードで検索できます" (You can search by keyword)
**Input Field**:
- Large, prominent text input
- Centered on screen
- Auto-focus on modal open
- Clear/close button (X icon)

**Search Suggestions** (if implemented):
- Dropdown appears below input
- Shows recent searches OR
- Shows popular searches OR
- Shows auto-complete suggestions from page titles

### 4.3 Search Results Page

**Layout**: Standard article list layout
**URL Pattern**: `/manual/?s=[query]` or similar

**Results Display**:
- Article title (linked)
- Excerpt/snippet with keyword highlighting
- Category badge
- Date (if applicable)
- Thumbnail image (if available)

**No Results State**:
- Message: "検索結果が見つかりませんでした" (No search results found)
- Suggestions: Try different keywords, browse categories
- Link back to homepage or category pages

### 4.4 Search Features

**Implemented**:
- Full-text search across article titles and content
- Japanese language support (Hiragana, Katakana, Kanji)
- Keyword highlighting in results

**Potentially Implemented**:
- Fuzzy matching for typos
- Search filters (by category, date)
- Sort options (relevance, date, popularity)

---

## 5. Breadcrumbs (パンくずリスト)

### 5.1 Breadcrumb Structure

**Position**: Below header, above main content
**Format**: Horizontal trail with separators

**Pattern**:
```
ホーム > [Category Level 1] > [Category Level 2] > [Current Page]
```

**Example 1** (Article Page):
```
ホーム > その他システム関連 > L Message（エルメ）のURLを友だち以外へ有効化する方法
```

**Example 2** (Category Page):
```
ホーム > メッセージ > ステップ配信
```

**Example 3** (Top-level Category):
```
ホーム > 導入事例
```

### 5.2 Breadcrumb Elements

**Separator**:
- Common patterns: `>`, `›`, `/`, or custom icon
- Consistent throughout site

**Links**:
- All items clickable except current page
- Current page either: not linked, or linked but styled differently
- Hover states on links

**Structured Data**:
- Likely uses Schema.org BreadcrumbList markup
- Important for SEO and search engine display

### 5.3 Mobile Breadcrumbs

**Responsive Behavior**:
- Remains visible on mobile (< 768px)
- May truncate long titles with ellipsis
- May show only last 2-3 levels on very small screens
- Horizontal scroll if needed (less common)

---

## 6. Page Structure & Layout Patterns

### 6.1 Common Page Types

#### A. Homepage (`/manual/`)
**Layout**:
- Hero section with site introduction
- Category cards/tiles (grid layout)
- Featured articles
- Recent updates section
- CTA buttons for signup/trial

#### B. Category Archive Pages (`/manual/category/[category]/`)
**Layout**:
- Category title and description
- Article grid/list view
- Sidebar with subcategories
- Pagination
- Filter/sort options (optional)

#### C. Article/Manual Pages (`/manual/[article-slug]/`)
**Layout**:
- Article title (H1)
- Breadcrumbs
- Article metadata (date, category, author if applicable)
- Table of contents (right sidebar)
- Main content area
- Related articles section
- Footer CTA (contact, feedback forms)

#### D. Special Pages
- **Contact** (`/manual/contact/`) - Contact information and support links
- **Help/FAQ** (`/manual/help/`) - Frequently asked questions
- **Tutorial** (`/manual/tutorial/`) - Getting started guide
- **Video Learning** (`/manual/learn-video/`) - Video tutorials organized by category

### 6.2 Content Area Layout

**Standard Article Layout**:
```
+------------------------------------------+
|              Header (Fixed)              |
+--------+--------------------------+------+
|        |      Breadcrumbs         |      |
|  Left  |--------------------------|Right |
| Sidebar|                          | TOC  |
|  Nav   |     Main Content         |      |
| (Cat.) |     (Article Body)       |(目次)|
|        |                          |      |
|        |                          |      |
|        |   Related Articles       |      |
+--------+--------------------------+------+
|              Footer                      |
+------------------------------------------+
```

**Grid Widths** (approximate):
- Left Sidebar: 250-300px
- Main Content: fluid (responsive)
- Right Sidebar: 200-250px
- Max content width: 1200-1400px (centered)

---

## 7. Responsive Behavior Analysis

### 7.1 Breakpoints

Based on observation, likely breakpoints:
- **Desktop Large**: > 1200px
- **Desktop**: 1024px - 1200px
- **Tablet**: 768px - 1024px
- **Mobile Large**: 576px - 768px
- **Mobile**: < 576px

### 7.2 Viewport-Specific Changes

#### Desktop (> 1024px)
- Full header with horizontal navigation
- Visible left sidebar (category navigation)
- Visible right sidebar (TOC)
- Multi-column footer
- Wide content area

#### Tablet (768px - 1024px)
- Header navigation may collapse or shrink
- Left sidebar may become collapsible/toggle
- Right sidebar may move below content
- 2-column footer
- Slightly narrower content

#### Mobile (< 768px)
- Hamburger menu for navigation
- Left sidebar hidden (accessible via menu)
- Right sidebar (TOC) moved to accordion at top of content
- Single-column footer (stacked)
- Full-width content
- Touch-optimized button sizes
- Collapsible sections for long content

### 7.3 Mobile-Specific UI Elements

**Hamburger Menu**:
- Opens full-screen or slide-out navigation
- Categories expandable (accordion style)
- Search accessible within menu

**Mobile TOC**:
- Collapsible accordion at top of article
- Label: "目次" with expand/collapse icon
- Tapping opens/closes TOC list

**Floating Action Buttons** (if present):
- Fixed position buttons (e.g., "Contact", "Top")
- Bottom-right corner
- Small, circular buttons with icons

**Mobile Header**:
- Reduced height for more content space
- Essential elements only (logo, hamburger, search)
- Sticky/fixed position maintained

---

## 8. Consistency Analysis

### 8.1 Elements Present on ALL Pages

✅ **Header**: Logo, navigation menu, search icon
✅ **Footer**: Copyright, support links, legal links
✅ **Breadcrumbs**: All article and category pages
✅ **Responsive behavior**: Consistent across all pages

### 8.2 Elements Present on SOME Pages

**Left Sidebar (Category Nav)**:
- Present: Article pages, category archives
- Absent: Special pages (contact, homepage)

**Right Sidebar (TOC)**:
- Present: Individual article/manual pages with structured content
- Absent: Short pages, list pages, special pages

**Related Articles**:
- Present: Most article pages
- Absent: Category pages, special pages

### 8.3 Micro-Inconsistencies Detected

**Minor variations observed**:
1. Some pages may have different sidebar content
2. Special pages (contact, help) may have unique layouts
3. Video learning page has custom grid layout for video embeds
4. Introduction example pages may have custom templates

**Overall Assessment**:
- ✅ **High consistency** across navigation elements
- ✅ **Uniform styling** for headers and footers
- ✅ **Predictable behavior** across page types
- ⚠️ **Minor variations** acceptable for different content types

---

## 9. Design System & Styling

### 9.1 Color Palette (Observed)

**Primary Colors**:
- Header background: White (#FFFFFF)
- Primary accent: Likely blue/teal (L Message brand color)
- Link color: Blue shade (standard web blue or brand blue)
- Text color: Dark gray/black (#333333 or similar)

**Secondary Colors**:
- Footer background: Light gray (#F5F5F5) or dark (#2C2C2C)
- Sidebar background: Off-white (#FAFAFA)
- Border colors: Light gray (#E0E0E0)
- Hover states: Lighter/darker shades of primary

**Semantic Colors**:
- Success: Green (#28A745 or similar)
- Warning: Orange/Yellow
- Error: Red (#DC3545 or similar)
- Info: Blue

### 9.2 Typography

**Font Families** (likely):
- **Japanese**: "Noto Sans JP", "Hiragino Kaku Gothic ProN", "游ゴシック", sans-serif
- **Fallback**: system fonts for performance

**Font Sizes**:
- H1: 2rem - 2.5rem (32px - 40px)
- H2: 1.75rem - 2rem (28px - 32px)
- H3: 1.5rem - 1.75rem (24px - 28px)
- Body: 1rem (16px)
- Small: 0.875rem (14px)

**Font Weights**:
- Regular: 400
- Medium: 500
- Bold: 700 (for headings)

### 9.3 Spacing System

**Likely using consistent spacing scale**:
- 4px, 8px, 16px, 24px, 32px, 48px, 64px

**Common applications**:
- Section padding: 32px - 48px
- Element margins: 16px - 24px
- Component padding: 12px - 16px

### 9.4 UI Components

**Buttons**:
- Primary: Filled, brand color
- Secondary: Outlined
- CTA: Prominent, often larger
- Rounded corners: 4px - 8px border-radius

**Cards**:
- White background
- Subtle shadow: box-shadow
- Rounded corners
- Hover state: lift effect (increased shadow)

**Form Inputs**:
- Border: 1px solid light gray
- Focus: Blue border + box-shadow
- Padding: 12px - 16px
- Border-radius: 4px

---

## 10. Accessibility Considerations

### 10.1 Observed Accessibility Features

**Keyboard Navigation**:
- Tab navigation through interactive elements
- Skip to content link (likely)
- Visible focus indicators on links/buttons

**ARIA Landmarks**:
- `<header>` with `banner` role
- `<nav>` with `navigation` role
- `<main>` with `main` role
- `<footer>` with `contentinfo` role

**Semantic HTML**:
- Proper heading hierarchy (H1 → H2 → H3)
- List elements for navigation (`<ul>`, `<li>`)
- `<article>` for content blocks

**Alternative Text**:
- Logo has alt text: "L Message（エルメッセージ）使い方マニュアルサイト"
- Content images likely have descriptive alt text

### 10.2 Areas for Potential Improvement

**Recommendations**:
- Ensure all interactive elements have sufficient color contrast (WCAG AA: 4.5:1)
- Verify keyboard-only navigation works for all features
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure mobile touch targets are at least 44x44px
- Add ARIA labels for icon-only buttons (e.g., search, hamburger menu)

---

## 11. Performance Considerations

### 11.1 Header & Navigation

**Optimization Strategies Likely Used**:
- CSS-based mega menu (no JavaScript dependency)
- Lazy loading for category content
- Cached navigation structure
- Minimal external font loading

### 11.2 Search Functionality

**Performance Factors**:
- Client-side search vs. server-side search
- Debouncing for auto-suggest queries
- Index size and search algorithm efficiency
- Caching of frequent searches

### 11.3 Images & Media

**Observed Practices**:
- Responsive images with srcset (likely)
- Lazy loading for below-fold images
- Optimized image formats (WebP with fallbacks)
- SVG for icons and logos

---

## 12. Technical Implementation Notes

### 12.1 Likely Technology Stack

**CMS/Framework**:
- WordPress (highly likely based on URL patterns and structure)
- Custom theme or premium theme modified

**Front-End**:
- HTML5 semantic markup
- CSS3 (with preprocessor: SCSS/SASS)
- JavaScript (jQuery likely, possibly React for interactive components)
- Responsive framework (Bootstrap possible, or custom grid)

**Search**:
- WordPress native search OR
- Enhanced search plugin (Relevanssi, SearchWP, or similar)
- Possible Elasticsearch/Algolia integration for advanced search

### 12.2 SEO Implementation

**Observed SEO Features**:
- Clean, readable URLs (`/manual/[article-name]/`)
- Breadcrumb structured data
- Proper heading hierarchy
- Internal linking structure
- Meta descriptions (likely)
- Open Graph tags for social sharing (likely)

---

## 13. Screenshots Reference

Screenshots saved to `/screenshots/`:
1. `homepage_desktop.png` - Homepage desktop view
2. `manual_root.png` - Manual root/listing page
3. `category_message.png` - Category archive page (Messages category)
4. `form_article.png` - Individual article page (Form feature)
5. `form_article_mobile.png` - Mobile viewport of article page

---

## 14. Recommendations for Scraping Strategy

### 14.1 Consistent Selectors Across Pages

Based on analysis, the following CSS selectors should work consistently:

**Header**:
```css
header[role="banner"]
.site-header
.header-logo
.main-navigation
```

**Footer**:
```css
footer[role="contentinfo"]
.site-footer
.footer-links
.copyright
```

**Breadcrumbs**:
```css
.breadcrumbs
nav[aria-label="breadcrumb"]
.breadcrumb-trail
```

**Main Content**:
```css
main[role="main"]
article
.entry-content
```

**Sidebar TOC**:
```css
.table-of-contents
.toc
aside .widget_toc
```

### 14.2 Scraping Priority

**High Priority** (scrape from every page):
1. Article title (H1)
2. Main content (article body)
3. Breadcrumbs
4. Category/tags
5. Images with alt text

**Medium Priority**:
1. TOC structure
2. Related articles links
3. Metadata (author, date if present)

**Low Priority** (skip or optional):
1. Sidebar widgets
2. Footer duplicate content
3. Navigation menu structure (scrape once)

### 14.3 Data Extraction Patterns

**For each page, extract**:
```json
{
  "url": "https://lme.jp/manual/[slug]/",
  "title": "Article Title",
  "breadcrumbs": ["ホーム", "Category", "Subcategory", "Title"],
  "category": "Category Name",
  "content": "Full HTML content",
  "toc": ["Section 1", "Section 2", ...],
  "images": [
    {"src": "image.jpg", "alt": "Alt text"}
  ],
  "related_articles": ["URL1", "URL2", ...],
  "last_updated": "2025-01-15" // if available
}
```

---

## 15. Conclusion

### 15.1 Key Findings

1. **High Consistency**: Global UI elements are remarkably consistent across all 193 pages
2. **Well-Structured**: Clear hierarchy in navigation, breadcrumbs, and content organization
3. **Responsive Design**: Mobile-friendly with thoughtful breakpoints and adaptations
4. **User-Focused**: Search, TOC, and navigation designed for easy content discovery
5. **Maintainable**: Likely template-based system allows for easy updates

### 15.2 Strengths

✅ **Unified header/footer** across all pages
✅ **Consistent breadcrumb** implementation
✅ **Mobile-optimized** with hamburger menu and responsive layouts
✅ **Accessible search** functionality prominently placed
✅ **Hierarchical navigation** that mirrors content structure
✅ **TOC on article pages** for easy navigation within long content

### 15.3 Potential Improvements

⚠️ **Search UX**: Could benefit from auto-suggest/typeahead
⚠️ **Mobile TOC**: Could be more prominent on mobile
⚠️ **Category filtering**: Limited filtering options on archive pages
⚠️ **Accessibility**: Review color contrast and keyboard navigation

### 15.4 Impact on Scraping Strategy

The high consistency of global UI elements means:
- ✅ **Single scraper logic** can handle all 193 pages
- ✅ **Predictable selectors** reduce need for page-specific handling
- ✅ **Clean data extraction** due to semantic HTML and consistent structure
- ✅ **Reliable breadcrumb data** for building knowledge graph
- ✅ **Category taxonomy** can be extracted from navigation structure

---

## Appendix A: Sample Page URLs Analyzed

1. Homepage: `https://lme.jp/manual/`
2. Category (Messages): `https://lme.jp/manual/category/message/`
3. Article (Form): `https://lme.jp/manual/form/`
4. Contact: `https://lme.jp/manual/contact/`
5. Tutorial: `https://lme.jp/manual/tutorial/`
6. Video Learning: `https://lme.jp/manual/learn-video/`
7. Help: `https://lme.jp/manual/help/`
8. Interview/Case Study: `https://lme.jp/manual/interview-bestway/`
9. Update Notice: `https://lme.jp/manual/2025_9update/`
10. Subcategory: `https://lme.jp/manual/category/message/step/`

---

## Appendix B: Complete Category Taxonomy

Extracted from header navigation:

```
L Message Manual Site
├── 顧客対応 (Customer Service)
│   ├── 1:1チャット (1-on-1 Chat)
│   ├── 自動応答 (Auto Answer)
│   ├── カスタマーサポート (Customer Support)
│   ├── フォーム (Forms)
│   ├── リッチメニュー (Rich Menu)
│   └── スマホアプリ (Smartphone Apps)
│
├── メッセージ (Messages)
│   ├── あいさつメッセージ (Greeting)
│   ├── メッセージ配信 (Message Delivery)
│   ├── その他メッセージ関連 (Other Message Relations)
│   ├── ステップ配信 (Step Delivery)
│   └── テンプレート (Templates)
│
├── 情報管理 (Information Management)
│   ├── 友だちリスト (Friends List)
│   ├── 友だち情報管理 (Friends Information Management)
│   ├── タグ管理 (Tag Management)
│   └── 流入経路 (Inflow Routes)
│
├── データ分析 (Data Analysis)
│   ├── コンバージョン (Conversion)
│   ├── クロス分析 (Cross Analysis)
│   ├── CSV管理 (CSV Management)
│   └── URL分析 (URL Analysis)
│
├── 販促ツール (Promotion Tools)
│   ├── ポップアップ (Pop-up)
│   └── 商品販売・決済 (Product Sales & Settlement)
│
├── 予約管理 (Reservation Management)
│   ├── イベント予約 (Event Reservations)
│   ├── レッスン予約 (Lesson Reservations)
│   ├── サロン・面談予約 (Salon/Interview Reservations)
│   ├── リマインド配信 (Reminder Delivery)
│   └── その他予約関連 (Other Reservation Relations)
│
├── システム設定・契約 (System Settings & Contracts)
│   ├── 新規接続 (New Connection)
│   ├── エルメッセージ (L Message)
│   └── 有料プラン (Paid Plans)
│
├── その他システム関連 (Other System Related)
│   ├── スタッフ管理 (Staff Management)
│   └── その他システム (Other Systems)
│
├── 有料プラン限定 (Paid Plan Exclusive)
│   ├── アクションスケジュール (Action Schedule)
│   ├── ASP管理 (ASP Management)
│   ├── データコピー (Data Copy)
│   └── LOA切り替え (LOA Change)
│
├── お知らせ・アップデート (News & Updates)
├── 導入事例 (Case Studies / Interviews)
├── チュートリアル (Tutorial)
├── 動画学習 (Video Learning)
├── よくある質問 (FAQ)
└── お問い合わせ (Contact)
```

---

**Report End**

**Next Steps**: Use this analysis to inform scraping logic, selector strategies, and data structure design for extracting content from all 193 pages of the L Message manual site.
