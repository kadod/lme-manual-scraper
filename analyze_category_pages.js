const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

// Read the paths file
const pathsData = JSON.parse(fs.readFileSync('./lme_manual_paths.json', 'utf8'));
const categoryPages = pathsData.categorized['カテゴリページ'];

console.log(`Analyzing ${categoryPages.length} category pages...`);

// Analysis data structure
const analysis = {
  totalPages: categoryPages.length,
  pages: [],
  commonPatterns: {
    header: {},
    navigation: {},
    contentElements: {},
    footer: {},
    styling: {}
  }
};

async function analyzePage(browser, url, index) {
  const page = await browser.newPage();

  try {
    console.log(`[${index + 1}/${categoryPages.length}] Analyzing: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // Wait for content to load
    await page.waitForTimeout(2000);

    // Extract page structure
    const pageData = await page.evaluate(() => {
      const getComputedStyles = (selector) => {
        const el = document.querySelector(selector);
        if (!el) return null;
        const computed = window.getComputedStyle(el);
        return {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          fontSize: computed.fontSize,
          fontFamily: computed.fontFamily,
          padding: computed.padding,
          margin: computed.margin
        };
      };

      // Header analysis
      const header = {
        exists: !!document.querySelector('header'),
        logo: !!document.querySelector('header img, header .logo'),
        logoAlt: document.querySelector('header img')?.alt || null,
        navigation: Array.from(document.querySelectorAll('header nav a, header nav li')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })),
        searchExists: !!document.querySelector('header [type="search"], header .search'),
        styles: getComputedStyles('header')
      };

      // Breadcrumb analysis
      const breadcrumb = {
        exists: !!document.querySelector('.breadcrumb, [class*="breadcrumb"], h1'),
        path: Array.from(document.querySelectorAll('.breadcrumb a, h1 a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })),
        currentPage: document.querySelector('h1')?.textContent.trim() || null
      };

      // Main content analysis
      const mainContent = {
        categoryTitle: document.querySelector('h1, .category-title')?.textContent.trim() || null,
        categoryDescription: document.querySelector('.category-description, p')?.textContent.trim() || null,

        // Subcategories/sections
        sections: Array.from(document.querySelectorAll('main section, main article > ul > li, .category-section')).map(section => ({
          title: section.querySelector('h2, h3, .section-title')?.textContent.trim() || null,
          icon: !!section.querySelector('img, svg, [class*="icon"]'),
          iconSrc: section.querySelector('img')?.src || null,
          description: section.querySelector('p, .description')?.textContent.trim() || null,
          articles: Array.from(section.querySelectorAll('a, li a')).map(a => ({
            text: a.textContent.trim(),
            href: a.href
          }))
        })),

        // Related categories section
        relatedCategories: {
          exists: !!document.querySelector('.related-categories, .other-categories'),
          title: document.querySelector('.related-categories h2, .other-categories h2')?.textContent.trim() || null,
          categories: Array.from(document.querySelectorAll('.related-categories .category-card, .other-categories .category-card')).map(card => ({
            title: card.querySelector('h3, .title')?.textContent.trim() || null,
            description: card.querySelector('p, .description')?.textContent.trim() || null,
            icon: !!card.querySelector('img'),
            link: card.querySelector('a')?.href || null,
            subcategories: Array.from(card.querySelectorAll('ul li a')).map(a => ({
              text: a.textContent.trim(),
              href: a.href
            }))
          }))
        }
      };

      // Footer analysis
      const footer = {
        exists: !!document.querySelector('footer'),
        copyright: document.querySelector('footer')?.textContent.match(/©.*?\d{4}/)?.[0] || null,
        links: Array.from(document.querySelectorAll('footer a')).map(a => ({
          text: a.textContent.trim(),
          href: a.href
        })),
        styles: getComputedStyles('footer')
      };

      // Layout analysis
      const layout = {
        hasContainer: !!document.querySelector('.container, .wrapper, [class*="container"]'),
        hasSidebar: !!document.querySelector('aside, .sidebar, [class*="sidebar"]'),
        gridLayout: !!document.querySelector('[class*="grid"], .category-grid'),
        flexLayout: window.getComputedStyle(document.querySelector('main') || document.body).display === 'flex'
      };

      // Responsive design check
      const responsive = {
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        hasMediaQueries: Array.from(document.styleSheets).some(sheet => {
          try {
            return Array.from(sheet.cssRules || []).some(rule => rule.media);
          } catch (e) {
            return false;
          }
        }),
        hasMobileMenu: !!document.querySelector('[class*="mobile"], .hamburger, .menu-toggle')
      };

      return {
        url: window.location.href,
        title: document.title,
        header,
        breadcrumb,
        mainContent,
        footer,
        layout,
        responsive
      };
    });

    // Take screenshot
    const screenshotPath = `./screenshots/category_${String(index + 1).padStart(2, '0')}.png`;
    await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    pageData.screenshot = screenshotPath;

    await page.close();
    return pageData;

  } catch (error) {
    console.error(`Error analyzing ${url}:`, error.message);
    await page.close();
    return {
      url,
      error: error.message
    };
  }
}

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Analyze all pages
  for (let i = 0; i < categoryPages.length; i++) {
    const pageData = await analyzePage(browser, categoryPages[i].url, i);
    analysis.pages.push(pageData);

    // Save intermediate results every 10 pages
    if ((i + 1) % 10 === 0) {
      fs.writeFileSync(
        './category_pages_analysis_intermediate.json',
        JSON.stringify(analysis, null, 2)
      );
      console.log(`Saved intermediate results (${i + 1}/${categoryPages.length})`);
    }
  }

  await browser.close();

  // Analyze common patterns
  analyzeCommonPatterns(analysis);

  // Save final results
  fs.writeFileSync(
    './category_pages_analysis.json',
    JSON.stringify(analysis, null, 2)
  );

  // Generate markdown report
  generateMarkdownReport(analysis);

  console.log('Analysis complete!');
}

function analyzeCommonPatterns(analysis) {
  const pages = analysis.pages.filter(p => !p.error);

  // Header patterns
  analysis.commonPatterns.header = {
    logoPresent: pages.filter(p => p.header?.logo).length,
    navigationStructure: getMostCommonValue(pages.map(p => JSON.stringify(p.header?.navigation))),
    searchFeature: pages.filter(p => p.header?.searchExists).length
  };

  // Navigation patterns
  analysis.commonPatterns.navigation = {
    breadcrumbPresent: pages.filter(p => p.breadcrumb?.exists).length,
    averageBreadcrumbDepth: average(pages.map(p => p.breadcrumb?.path?.length || 0))
  };

  // Content patterns
  analysis.commonPatterns.contentElements = {
    sectionsWithIcons: pages.filter(p => p.mainContent?.sections?.some(s => s.icon)).length,
    averageSectionsPerPage: average(pages.map(p => p.mainContent?.sections?.length || 0)),
    relatedCategoriesPresent: pages.filter(p => p.mainContent?.relatedCategories?.exists).length
  };

  // Layout patterns
  analysis.commonPatterns.layout = {
    gridBased: pages.filter(p => p.layout?.gridLayout).length,
    flexBased: pages.filter(p => p.layout?.flexLayout).length,
    withSidebar: pages.filter(p => p.layout?.hasSidebar).length
  };

  // Responsive patterns
  analysis.commonPatterns.responsive = {
    hasMediaQueries: pages.filter(p => p.responsive?.hasMediaQueries).length,
    hasMobileMenu: pages.filter(p => p.responsive?.hasMobileMenu).length
  };
}

function getMostCommonValue(arr) {
  const frequency = {};
  arr.forEach(item => {
    frequency[item] = (frequency[item] || 0) + 1;
  });
  return Object.keys(frequency).sort((a, b) => frequency[b] - frequency[a])[0];
}

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function generateMarkdownReport(analysis) {
  const pages = analysis.pages.filter(p => !p.error);

  let md = `# L Message Manual Category Pages - Comprehensive Analysis

## Overview
- Total Pages Analyzed: ${analysis.totalPages}
- Successful Analyses: ${pages.length}
- Failed Analyses: ${analysis.totalPages - pages.length}

## Common Patterns

### Header Structure
- Logo Present: ${analysis.commonPatterns.header.logoPresent}/${pages.length} pages
- Search Feature: ${analysis.commonPatterns.header.searchFeature}/${pages.length} pages

### Navigation
- Breadcrumb Present: ${analysis.commonPatterns.navigation.breadcrumbPresent}/${pages.length} pages
- Average Breadcrumb Depth: ${analysis.commonPatterns.navigation.averageBreadcrumbDepth.toFixed(1)} levels

### Content Elements
- Sections with Icons: ${analysis.commonPatterns.contentElements.sectionsWithIcons}/${pages.length} pages
- Average Sections per Page: ${analysis.commonPatterns.contentElements.averageSectionsPerPage.toFixed(1)}
- Related Categories Section: ${analysis.commonPatterns.contentElements.relatedCategoriesPresent}/${pages.length} pages

### Layout
- Grid-based Layout: ${analysis.commonPatterns.layout.gridBased}/${pages.length} pages
- Flex-based Layout: ${analysis.commonPatterns.layout.flexBased}/${pages.length} pages
- With Sidebar: ${analysis.commonPatterns.layout.withSidebar}/${pages.length} pages

### Responsive Design
- Media Queries: ${analysis.commonPatterns.responsive.hasMediaQueries}/${pages.length} pages
- Mobile Menu: ${analysis.commonPatterns.responsive.hasMobileMenu}/${pages.length} pages

## Detailed Page Analysis

`;

  pages.forEach((page, index) => {
    md += `\n### ${index + 1}. ${page.title || 'Untitled'}\n`;
    md += `- URL: ${page.url}\n`;
    md += `- Category: ${page.mainContent?.categoryTitle || 'N/A'}\n`;
    md += `- Sections: ${page.mainContent?.sections?.length || 0}\n`;
    md += `- Related Categories: ${page.mainContent?.relatedCategories?.categories?.length || 0}\n`;
    md += `- Screenshot: ${page.screenshot}\n`;
  });

  md += `\n## Supabase Table Design Recommendation

\`\`\`sql
-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  parent_id UUID REFERENCES categories(id),
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Category sections (for subcategories within a category page)
CREATE TABLE category_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles/Manual pages
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  category_id UUID REFERENCES categories(id),
  section_id UUID REFERENCES category_sections(id),
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Breadcrumb paths (for navigation)
CREATE TABLE breadcrumbs (
  article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id),
  position INTEGER,
  PRIMARY KEY (article_id, position)
);

-- Related categories mapping
CREATE TABLE category_relations (
  from_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  to_category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (from_category_id, to_category_id)
);
\`\`\`

## Implementation Notes

1. **Header Component**:
   - Sticky header with logo and navigation
   - Search functionality in header
   - Consistent across all pages

2. **Breadcrumb Component**:
   - Hierarchical navigation showing current location
   - Average depth: ${analysis.commonPatterns.navigation.averageBreadcrumbDepth.toFixed(1)} levels

3. **Category Page Layout**:
   - Main category section with icon and description
   - Multiple subsections with article lists
   - Related categories grid at bottom
   - Grid/Flex based responsive layout

4. **Content Elements**:
   - Category icons for visual identification
   - Descriptive text for each section
   - Link cards for articles
   - "基本的な操作マニュアル" and "その他の記事" subsections

5. **Related Categories**:
   - Card-based grid layout
   - Each card shows icon, title, description
   - List of subcategories under each
   - Link to full category page

6. **Styling**:
   - Clean, minimal design
   - Icon-driven visual hierarchy
   - Consistent spacing and typography
   - Mobile-responsive layout
`;

  fs.writeFileSync('./claudedocs/category_pages_analysis.md', md);
  console.log('Markdown report generated: claudedocs/category_pages_analysis.md');
}

main().catch(console.error);
