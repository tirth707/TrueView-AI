from flask import Flask, request, jsonify
from bs4 import BeautifulSoup
import requests
from fake_useragent import UserAgent
import urllib.parse

app = Flask(__name__)

@app.route('/scan', methods=['POST'])
def scan_product():
    data = request.json
    url = data.get('url')

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    print(f"🕵️‍♂️ Scanning: {url}")

    try:
        ua = UserAgent()
        # 1. Advanced Headers to trick Amazon into thinking we are a real Mac/Windows user
        headers = {
            'User-Agent': ua.random,
            'Accept-Language': 'en-US, en;q=0.5',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://www.google.com/', # Pretend we clicked a link from Google
            'DNT': '1'
        }

        response = requests.get(url, headers=headers)
        soup = BeautifulSoup(response.content, 'html.parser')

        title = None
        
        # Attempt 1: The Standard Amazon Title ID
        title_tag = soup.find("span", {"id": "productTitle"})
        if title_tag:
            title = title_tag.get_text().strip()
        
        # Attempt 2: Fallback to the Website <title> tag
        if not title and soup.title:
            title = soup.title.get_text().strip().replace('Amazon.in: Buy ', '').split('|')[0].strip()

        # Attempt 3: Ultimate Fallback (Extract name from the URL text itself)
        if not title or "Robot Check" in title or "Amazon.in" in title:
            parsed_url = urllib.parse.urlparse(url)
            path_parts = parsed_url.path.split('/')
            for part in path_parts:
                if '-' in part:  # Amazon product names in URLs usually have dashes
                    title = part.replace('-', ' ').title()
                    break
        
        if not title:
            title = "Unknown Product"

        return jsonify({
            "productName": title,
            "platform": "Amazon" if "amazon" in url.lower() else "Other",
            "status": "Scraped Successfully"
        })

    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=6000, debug=True)