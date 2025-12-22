# AI-Video-SaaS
AI Video SaaS Platform

## Airtable Scraper

A comprehensive Python script to scrape Airtable tables with built-in deduplication and date filtering.

### ⭐ No Airtable API Key Required!

This scraper uses Selenium to directly scrape public Airtable shared views - no API key needed!

### Features

- **🔓 No API required:** Uses Selenium to scrape public shared views
- **🔄 Smart deduplication:** Removes redundant rows based on specified fields
- **📅 Date filtering:** Get only the most up-to-date rows
- **🤖 n8n integration:** Ready-to-use with n8n workflows via HTTP API or Execute Command
- **📦 Export formats:** JSON and CSV support
- **👻 Headless operation:** Can run without GUI for automation
- **🐳 Docker support:** Easy deployment with Docker and docker-compose

### Quick Start for n8n

See [N8N_GUIDE.md](N8N_GUIDE.md) for complete n8n integration instructions.

**Using Docker (Recommended):**
```bash
docker-compose up -d
# API available at http://localhost:5000
# n8n available at http://localhost:5678
```

**Using Python directly:**
```bash
pip install -r requirements.txt
python scrape_airtable_n8n.py
```

### Setup (Standalone Usage)

1. **Install dependencies:**
```bash
pip install -r requirements.txt
```

2. **Install Chrome/Chromium:**
```bash
# Ubuntu/Debian
sudo apt-get install chromium-browser chromium-chromedriver

# macOS
brew install chromedriver
```

No API keys needed! The scraper uses Selenium to access public shared views.

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

#### For n8n Integration
```bash
# Run the n8n-optimized script
python scrape_airtable_n8n.py

# Or start the API server for HTTP requests
python api_server.py
```

See [N8N_GUIDE.md](N8N_GUIDE.md) for detailed n8n workflows and examples.

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

#### For n8n (No API Required)
```python
from scrape_airtable_n8n import scrape_for_n8n

# Scrape with automatic deduplication and filtering
result = scrape_for_n8n(
    url="https://airtable.com/appXXX/shrXXX/tblXXX",
    dedupe_fields=['Name', 'Email'],
    recent_days=30,
    headless=True
)

print(f"Success: {result['success']}")
print(f"Count: {result['count']}")
print(f"Data: {result['data']}")
```

#### For Standalone Use
```python
from scrape_airtable import AirtableScraper

# Create scraper
scraper = AirtableScraper("https://airtable.com/appXXX/shrXXX/tblXXX")

# Scrape with Selenium (no API key needed!)
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
- Verify you're not using a private/restricted view

**No data scraped:**
- Run with `--headless false` to see what's happening
- Check `airtable_page_source.html` and `airtable_error_screenshot.png` for debugging
- Ensure Chrome/Chromium is properly installed

**For n8n issues:**
- See [N8N_GUIDE.md](N8N_GUIDE.md) for detailed troubleshooting

### Project Structure

```
.
├── scrape_airtable.py          # Main standalone scraper
├── scrape_airtable_n8n.py      # n8n-optimized version (no API needed!)
├── api_server.py               # Flask API for n8n HTTP requests
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker image definition
├── docker-compose.yml          # Run both scraper + n8n
├── n8n_workflow_example.json   # Example n8n workflow
├── N8N_GUIDE.md               # Complete n8n integration guide
├── .env.example               # Environment variable template
└── .gitignore                 # Git ignore rules
```
