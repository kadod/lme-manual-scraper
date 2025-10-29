#!/usr/bin/env python3
"""
L Message Manual URL Scraper
https://lme.jp/manual/ からすべてのURLパスを取得して整理します
"""

import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
import json
from collections import defaultdict
import time

class LmeManualScraper:
    def __init__(self, base_url="https://lme.jp/manual/"):
        self.base_url = base_url
        self.visited_urls = set()
        self.all_paths = []
        self.categorized_paths = defaultdict(list)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
        })

    def is_valid_url(self, url):
        """URLが有効でlme.jp/manual/配下かチェック"""
        parsed = urlparse(url)
        return (
            parsed.netloc == 'lme.jp' and
            parsed.path.startswith('/manual/') and
            not parsed.path.endswith(('.jpg', '.png', '.gif', '.css', '.js', '.pdf'))
        )

    def fetch_page(self, url):
        """ページを取得"""
        try:
            response = self.session.get(url, timeout=10)
            response.raise_for_status()
            return response.text
        except Exception as e:
            print(f"エラー: {url} - {e}")
            return None

    def extract_links(self, html, current_url):
        """HTMLからリンクを抽出"""
        soup = BeautifulSoup(html, 'html.parser')
        links = set()

        for a_tag in soup.find_all('a', href=True):
            href = a_tag['href']
            full_url = urljoin(current_url, href)

            # フラグメント(#)を除去
            full_url = full_url.split('#')[0]

            if self.is_valid_url(full_url):
                links.add(full_url)

        return links

    def categorize_path(self, url):
        """URLをカテゴリ分類"""
        path = urlparse(url).path
        parts = [p for p in path.split('/') if p]

        if len(parts) <= 1:
            return 'トップページ'
        elif 'category' in parts:
            return 'カテゴリページ'
        elif 'tutorial' in path:
            return 'チュートリアル'
        elif 'learn-video' in path:
            return '動画学習'
        elif 'contact' in path:
            return 'お問い合わせ'
        elif 'information' in path or 'update' in path:
            return 'お知らせ・アップデート'
        elif 'interview' in path or 'introduction_example' in path:
            return '導入事例'
        else:
            return '記事・マニュアル'

    def scrape(self, max_depth=2):
        """再帰的にサイトをクロール"""
        to_visit = [(self.base_url, 0)]

        while to_visit:
            current_url, depth = to_visit.pop(0)

            if current_url in self.visited_urls or depth > max_depth:
                continue

            print(f"クロール中: {current_url} (深さ: {depth})")
            self.visited_urls.add(current_url)

            html = self.fetch_page(current_url)
            if not html:
                continue

            # パス情報を保存
            path = urlparse(current_url).path
            self.all_paths.append({
                'url': current_url,
                'path': path,
                'depth': depth
            })

            # カテゴリ分類
            category = self.categorize_path(current_url)
            self.categorized_paths[category].append({
                'url': current_url,
                'path': path
            })

            # 新しいリンクを発見
            links = self.extract_links(html, current_url)
            for link in links:
                if link not in self.visited_urls:
                    to_visit.append((link, depth + 1))

            # サーバーに負荷をかけないよう待機
            time.sleep(0.5)

    def save_results(self):
        """結果をファイルに保存"""
        # JSON形式で保存
        with open('lme_manual_paths.json', 'w', encoding='utf-8') as f:
            json.dump({
                'total_pages': len(self.all_paths),
                'all_paths': self.all_paths,
                'categorized': dict(self.categorized_paths)
            }, f, ensure_ascii=False, indent=2)

        # テキスト形式で保存（読みやすい版）
        with open('lme_manual_paths.txt', 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("L Message マニュアルサイト - 全URLパス一覧\n")
            f.write(f"総ページ数: {len(self.all_paths)}\n")
            f.write("=" * 80 + "\n\n")

            for category, paths in sorted(self.categorized_paths.items()):
                f.write(f"\n【{category}】 ({len(paths)}ページ)\n")
                f.write("-" * 80 + "\n")
                for item in sorted(paths, key=lambda x: x['path']):
                    f.write(f"  • {item['path']}\n")
                    f.write(f"    {item['url']}\n\n")

        # Markdown形式で保存
        with open('README.md', 'w', encoding='utf-8') as f:
            f.write("# L Message マニュアルサイト URL一覧\n\n")
            f.write(f"**総ページ数:** {len(self.all_paths)}\n\n")
            f.write("このリポジトリは https://lme.jp/manual/ のすべてのURLパスを取得・整理したものです。\n\n")

            f.write("## カテゴリ別URL一覧\n\n")
            for category, paths in sorted(self.categorized_paths.items()):
                f.write(f"### {category} ({len(paths)}ページ)\n\n")
                for item in sorted(paths, key=lambda x: x['path']):
                    f.write(f"- [{item['path']}]({item['url']})\n")
                f.write("\n")

        print(f"\n✅ 結果を保存しました:")
        print(f"  - lme_manual_paths.json (JSON形式)")
        print(f"  - lme_manual_paths.txt (テキスト形式)")
        print(f"  - README.md (Markdown形式)")
        print(f"\n📊 統計:")
        print(f"  総ページ数: {len(self.all_paths)}")
        for category, paths in sorted(self.categorized_paths.items()):
            print(f"  {category}: {len(paths)}ページ")

def main():
    print("=" * 80)
    print("L Message マニュアルサイト URLスクレイパー")
    print("=" * 80)
    print()

    scraper = LmeManualScraper()
    scraper.scrape(max_depth=2)
    scraper.save_results()

    print("\n✅ スクレイピング完了！")

if __name__ == "__main__":
    main()
