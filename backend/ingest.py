import requests
from bs4 import BeautifulSoup
import json

def fetch_and_clean(url):
    resp = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    soup = BeautifulSoup(resp.text, "html.parser")
    text = soup.get_text(" ", strip=True)
    return text

if __name__ == "__main__":
    with open("seed_urls.json") as f:
        data = json.load(f)
    for url in data["urls"]:
        print(f"Fetching {url}...")
        content = fetch_and_clean(url)
        # save raw for now
        with open(f"indexes/{url.split('/')[-2] or 'page'}.txt", "w") as outf:
            outf.write(content[:2000])  # sample
    print("Ingestion done. Next: embeddings + FAISS integration.")
