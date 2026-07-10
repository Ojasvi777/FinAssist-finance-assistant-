import sys
import os
import json
from playwright.sync_api import sync_playwright
from lxml.html.clean import Cleaner

OUTPUT_DIR = "data/raw"
MANIFEST_PATH = os.path.join(OUTPUT_DIR, "manifest.json")
os.makedirs(OUTPUT_DIR, exist_ok=True)

cleaner = Cleaner(
    scripts=True, javascript=True,
    comments=True, style=True,
    links=True, meta=True,
    page_structure=False, safe_attrs_only=False
)


def save_page_content(filename, content):
    path = os.path.join(OUTPUT_DIR, filename)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"Saved {path} ({len(content)} characters)")


def crawl_urls(seed_file):
    with open(seed_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict) and "urls" in data:
            urls = data["urls"]
        elif isinstance(data, list):
            urls = data
        else:
            raise ValueError("seed_urls.json must be a list or {'urls': [...]}")

    manifest = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        for idx, url in enumerate(urls, 1):
            print(f"\n[{idx}/{len(urls)}] Crawling: {url}\n")
            try:
                page = context.new_page()
                page.goto(url, timeout=90000, wait_until="domcontentloaded")
                page.wait_for_timeout(5000)

                title = page.title() or url

                selectors = ["main", "div[role=main]", "article", "body"]
                extracted = ""
                for sel in selectors:
                    try:
                        snippet = page.inner_text(sel)
                        if len(snippet.strip()) > 200:
                            extracted = snippet
                            break
                    except Exception:
                        continue

                if not extracted:
                    extracted = page.content()

                extracted = cleaner.clean_html(extracted)

                filename = f"page_{idx}.txt"
                save_page_content(filename, extracted)

                manifest.append({"file": filename, "url": url, "title": title})

                page.close()
            except Exception as e:
                print(f"Error with {url}: {e}")

        browser.close()

    with open(MANIFEST_PATH, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
    print(f"\nManifest saved to {MANIFEST_PATH} ({len(manifest)} pages)")


def main(seed_file):
    crawl_urls(seed_file)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crawl.py seed_urls.json")
    else:
        main(sys.argv[1])