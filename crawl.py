import sys
import os
import json
from playwright.sync_api import sync_playwright
from lxml.html.clean import Cleaner

# Setup output folder
OUTPUT_DIR = "data/raw"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Cleaner to remove nav, footer, scripts, etc.
cleaner = Cleaner(
    scripts=True, javascript=True,
    comments=True, style=True,
    links=True, meta=True,
    page_structure=False, safe_attrs_only=False
)

def save_page_content(url, content, index):
    filename = os.path.join(OUTPUT_DIR, f"page_{index}.txt")
    with open(filename, "w", encoding="utf-8") as f:
        f.write(content.strip())
    print(f"✅ Saved {filename} ({len(content)} characters)")


def crawl_urls(seed_file):
    with open(seed_file, "r", encoding="utf-8") as f:
        data = json.load(f)
        if isinstance(data, dict) and "urls" in data:
            urls = data["urls"]
        elif isinstance(data, list):
            urls = data
        else:
            raise ValueError("seed_urls.json must be either a list of URLs or { 'urls': [ ... ] }")


    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context()

        for idx, url in enumerate(urls, 1):
            print(f"\n[{idx}/{len(urls)}] Crawling: {url}\n")
            try:
                page = context.new_page()
                page.goto(url, timeout=90000, wait_until="domcontentloaded")
                page.wait_for_timeout(5000)  # let scripts finish

                # Try to extract main content
                selectors = ["main", "div[role=main]", "article", "body"]
                extracted = ""
                for sel in selectors:
                    try:
                        snippet = page.inner_text(sel)
                        if len(snippet.strip()) > 200:  # not just nav bar
                            extracted = snippet
                            break
                    except:
                        continue

                if not extracted:
                    extracted = page.content()  # fallback raw HTML

                # Clean unnecessary tags
                extracted = cleaner.clean_html(extracted)

                # Save
                save_page_content(url, extracted, idx)

                page.close()
            except Exception as e:
                print(f"❌ Error with {url}: {e}")

        browser.close()


def main(seed_file):
    crawl_urls(seed_file)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python crawl.py seed_urls.json")
    else:
        main(sys.argv[1])