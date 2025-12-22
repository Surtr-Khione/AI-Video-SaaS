# Running Airtable Scraper in Self-Hosted n8n

If you're running n8n on your own server (not cloud), you can execute the Python scraper directly!

## Prerequisites

Your n8n server needs:
1. Python 3.8+
2. Chrome/Chromium browser
3. Python dependencies installed

## One-Time Setup

### 1. Install System Dependencies

**Ubuntu/Debian:**
```bash
# Install Chrome and ChromeDriver
sudo apt-get update
sudo apt-get install -y chromium-browser chromium-chromedriver python3 python3-pip

# Or use Google Chrome instead:
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo apt install -y ./google-chrome-stable_current_amd64.deb
```

**CentOS/RHEL:**
```bash
sudo yum install -y chromium chromium-headless python3 python3-pip
```

**macOS:**
```bash
brew install chromium python3
```

### 2. Install Python Dependencies

```bash
# Clone your repo (or download the script)
cd /opt
git clone https://github.com/Surtr-Khione/AI-Video-SaaS.git
cd AI-Video-SaaS

# Install dependencies
pip3 install -r requirements.txt
```

### 3. Make Script Executable

```bash
chmod +x scrape_airtable_n8n.py
```

### 4. Test It

```bash
python3 scrape_airtable_n8n.py
```

You should see JSON output with your Airtable data!

---

## Using in n8n Workflows

### Method 1: Execute Command Node (Recommended)

**Node Configuration:**

1. **Add Execute Command Node**

2. **Command:**
   ```bash
   /usr/bin/python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py
   ```

3. **Environment Variables (optional):**
   ```
   AIRTABLE_URL=https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT
   HEADLESS=true
   RECENT_DAYS=30
   ```

4. **Add Code Node** to parse output:
   ```javascript
   const output = JSON.parse($input.item.json.stdout);

   if (!output.success) {
     throw new Error(`Scraping failed: ${output.error}`);
   }

   console.log(`✓ Scraped ${output.count} rows`);

   return output.data.map(row => ({ json: row }));
   ```

### Method 2: Python Code Node (if available)

Some n8n versions support Python in Code nodes:

1. **Add Code Node**

2. **Select Language: Python**

3. **Paste this code:**

```python
import json
import os
import sys

# Add the script directory to path
sys.path.insert(0, '/opt/AI-Video-SaaS')

# Import the scraper
from scrape_airtable_n8n import scrape_for_n8n

# Configure
url = 'https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT'
recent_days = 30

# Run scraper
result = scrape_for_n8n(
    url=url,
    recent_days=recent_days,
    headless=True
)

# Return data
if result['success']:
    return [{'json': row} for row in result['data']]
else:
    raise Exception(f"Scraping failed: {result['error']}")
```

---

## Complete Workflow Example

```
┌──────────────────┐
│ Schedule Trigger │
│  Daily at 9am    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Execute Command  │
│ Run Python       │
│ scraper          │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Code Node        │
│ Parse JSON       │
│ output           │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Split in Batches │
│ (optional)       │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ Google Sheets    │
│ Save each row    │
└──────────────────┘
```

---

## Workflow JSON (Import This)

```json
{
  "name": "Airtable Scraper - Self-Hosted",
  "nodes": [
    {
      "parameters": {},
      "name": "Manual Trigger",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [250, 300]
    },
    {
      "parameters": {
        "command": "/usr/bin/python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py",
        "additionalFields": {
          "env": {
            "envVars": [
              {
                "name": "AIRTABLE_URL",
                "value": "https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT"
              },
              {
                "name": "HEADLESS",
                "value": "true"
              },
              {
                "name": "RECENT_DAYS",
                "value": "30"
              }
            ]
          }
        }
      },
      "name": "Run Python Scraper",
      "type": "n8n-nodes-base.executeCommand",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "jsCode": "const output = JSON.parse($input.item.json.stdout);\n\nif (!output.success) {\n  throw new Error(`Scraping failed: ${output.error}`);\n}\n\nconsole.log(`✓ Scraped ${output.count} rows`);\n\nreturn output.data.map(row => ({ json: row }));"
      },
      "name": "Parse Output",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [650, 300]
    }
  ],
  "connections": {
    "Manual Trigger": {
      "main": [
        [
          {
            "node": "Run Python Scraper",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Run Python Scraper": {
      "main": [
        [
          {
            "node": "Parse Output",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}
```

---

## Troubleshooting

### "Command not found: python3"

**Fix:**
```bash
# Find Python path
which python3
# Use the full path in your Execute Command node
# e.g., /usr/bin/python3
```

### "selenium module not found"

**Fix:**
```bash
pip3 install selenium
# Or with full path:
/usr/bin/pip3 install selenium
```

### "ChromeDriver not found"

**Fix:**
```bash
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# Or install manually:
wget https://chromedriver.storage.googleapis.com/LATEST_RELEASE
LATEST=$(cat LATEST_RELEASE)
wget https://chromedriver.storage.googleapis.com/$LATEST/chromedriver_linux64.zip
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver
```

### "Permission denied"

**Fix:**
```bash
# Make script executable
sudo chmod +x /opt/AI-Video-SaaS/scrape_airtable_n8n.py

# Or run with python3 explicitly (as shown in examples)
```

### Timeout errors

**Fix:**
```bash
# Increase timeout in Execute Command node
# Set to 120000 (2 minutes) or more
```

### "Display not found" error

**Fix:** Make sure HEADLESS is set to true
```bash
export HEADLESS=true
```

---

## Performance Tips

### 1. Run on Same Server as n8n

This minimizes latency and makes file access easier.

### 2. Use Caching

If scraping the same table frequently, consider caching results:

```bash
# In Execute Command node
python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py > /tmp/airtable_cache.json
cat /tmp/airtable_cache.json
```

### 3. Resource Limits

Selenium + Chrome can use significant RAM (300-500MB per instance). Make sure your server has enough resources.

### 4. Concurrent Scraping

Don't run multiple Chrome instances simultaneously - it will overwhelm your server. Use n8n's queue mode.

---

## Docker Setup (Alternative)

If you're running n8n in Docker, mount the scraper:

### docker-compose.yml

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=password
    volumes:
      - n8n_data:/home/node/.n8n
      - ./AI-Video-SaaS:/opt/scraper:ro
    depends_on:
      - chrome

  # Chrome for Selenium
  chrome:
    image: selenium/standalone-chrome:latest
    ports:
      - "4444:4444"
    environment:
      - SE_NODE_MAX_SESSIONS=1
      - SE_NODE_SESSION_TIMEOUT=300

volumes:
  n8n_data:
```

Then in n8n Execute Command:
```bash
python3 /opt/scraper/scrape_airtable_n8n.py
```

---

## Comparison: Self-Hosted vs Cloud API

| Feature | Self-Hosted n8n | Cloud API (Railway) |
|---------|----------------|---------------------|
| **Setup Complexity** | Medium (install deps) | Easy (one-click) |
| **Maintenance** | You manage updates | Managed for you |
| **Cost** | Server costs (~$5-20/mo) | Free tier available |
| **Performance** | Local = faster | Network latency |
| **Scalability** | Limited by server | Auto-scales |
| **Security** | You control everything | Managed security |

**Recommendation:**
- Already have a server? Use self-hosted approach
- Using cloud n8n? Use Railway/Render API approach

---

## Need Help?

1. Check n8n logs: Settings → Log Streaming
2. Test Python script manually on server
3. Verify Chrome is installed: `chromium-browser --version`
4. Check permissions: `ls -la /opt/AI-Video-SaaS/`
