# AI-Video-SaaS
AI Video SaaS Platform

## Airtable Scraper

A comprehensive Python script to scrape Airtable tables with built-in deduplication and date filtering.

### Features

- **Multiple scraping methods:**
  - Selenium-based scraping for shared views (works without API key)
  - Airtable API integration for authenticated access
- **Smart deduplication:** Removes redundant rows based on specified fields
- **Date filtering:** Get only the most up-to-date rows
- **Export formats:** JSON and CSV support
- **Headless operation:** Can run without GUI for automation

### Setup

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install Chrome/Chromium** (for Selenium method):
```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser chromium-chromedriver

# macOS
brew install chromedriver
```

3. **(Optional) Set up API key** for API-based scraping:
```bash
cp .env.example .env
# Edit .env and add your Airtable API key
```

### Usage

#### Basic Usage (Selenium)
```bash
python scrape_airtable.py
```

This will scrape the default table URL with automatic deduplication and save to `airtable_data.json`.

#### Custom URL
```bash
python scrape_airtable.py "https://airtable.com/appXXX/shrXXX/tblXXX"
```

#### Using API Method
```bash
python scrape_airtable.py --method api --api-key YOUR_API_KEY
# Or set AIRTABLE_API_KEY environment variable
export AIRTABLE_API_KEY=your_key_here
python scrape_airtable.py --method api
```

#### Advanced Options
```bash
# Save as CSV
python scrape_airtable.py --output data.csv

# Filter to last 30 days
python scrape_airtable.py --recent-days 30

# Custom deduplication fields
python scrape_airtable.py --dedupe-fields "Name" "Email" "Date"

# Run with visible browser (for debugging)
python scrape_airtable.py --headless false
```

### Python API

You can also use the scraper programmatically:

```python
from scrape_airtable import AirtableScraper

# Create scraper
scraper = AirtableScraper("https://airtable.com/appXXX/shrXXX/tblXXX")

# Scrape with Selenium
data = scraper.scrape_with_selenium(headless=True)

# Remove duplicates
scraper.remove_duplicates(key_fields=['Name', 'Email'])

# Filter recent rows
scraper.filter_recent(date_field='createdTime', days=30)

# Save data
scraper.save_to_json('output.json')
scraper.save_to_csv('output.csv')
```

### Troubleshooting

**403 Error with Selenium:**
- Make sure the Airtable view is shared publicly
- Check if the URL is a shared view link (starts with `shr`)

**No data scraped:**
- Run with `--headless false` to see what's happening
- Check `airtable_page_source.html` and `airtable_error_screenshot.png` for debugging

**API authentication errors:**
- Verify your API key is correct
- Check you have access to the base and table
