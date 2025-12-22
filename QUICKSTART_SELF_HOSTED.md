# Quick Start: Self-Hosted n8n in Cloud

Perfect setup for running the Airtable scraper directly in your self-hosted n8n!

## 🚀 Two Methods

### Method A: Direct Installation (If n8n Already Installed)
**Best if:** n8n is already running on your server

### Method B: Docker Setup (Recommended)
**Best if:** Starting fresh or using Docker

---

## Method A: Direct Installation

### 1. SSH into Your Server

```bash
ssh user@your-server.com
```

### 2. Install Dependencies

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install -y chromium-browser chromium-chromedriver python3 python3-pip git

# Install Python packages
sudo pip3 install selenium requests pandas flask flask-cors
```

**CentOS/RHEL:**
```bash
sudo yum install -y chromium chromium-headless python3 python3-pip git
sudo pip3 install selenium requests pandas flask flask-cors
```

### 3. Install the Scraper

```bash
cd /opt
sudo git clone https://github.com/Surtr-Khione/AI-Video-SaaS.git
cd AI-Video-SaaS
sudo chmod +x scrape_airtable_n8n.py
```

### 4. Test It

```bash
export AIRTABLE_URL="https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT"
export HEADLESS=true
export RECENT_DAYS=30

python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py
```

You should see JSON output! ✅

### 5. Create n8n Workflow

In your n8n web interface:

1. **Create new workflow**

2. **Add Execute Command node:**
   - Command: `python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py`
   - Environment Variables:
     ```
     HEADLESS=true
     RECENT_DAYS=30
     ```

3. **Add Code node** (to parse output):
   ```javascript
   const output = JSON.parse($input.item.json.stdout);
   if (!output.success) throw new Error(output.error);
   console.log(`✓ Scraped ${output.count} rows`);
   return output.data.map(row => ({ json: row }));
   ```

4. **Done!** Test the workflow

---

## Method B: Docker Setup (Recommended)

### 1. Clone the Repo

```bash
cd ~
git clone https://github.com/Surtr-Khione/AI-Video-SaaS.git
cd AI-Video-SaaS
```

### 2. Update Configuration

Edit `docker-compose.n8n.yml`:

```bash
nano docker-compose.n8n.yml
```

Change these lines:
```yaml
# Change admin password
- N8N_BASIC_AUTH_PASSWORD=YOUR_SECURE_PASSWORD

# Change webhook URL to your domain
- WEBHOOK_URL=https://yourdomain.com/

# Update timezone
- GENERIC_TIMEZONE=America/New_York
```

### 3. Build and Start

```bash
# Build the custom n8n image with scraper
docker-compose -f docker-compose.n8n.yml build

# Start n8n
docker-compose -f docker-compose.n8n.yml up -d

# Check logs
docker-compose -f docker-compose.n8n.yml logs -f
```

### 4. Access n8n

Open: `http://your-server-ip:5678`

Login with:
- Username: `admin`
- Password: (what you set in docker-compose.n8n.yml)

### 5. Create Workflow in n8n

Same as Method A, step 5 above!

### 6. Update Scraper Code (Optional)

When you want to update the scraper:

```bash
cd ~/AI-Video-SaaS
git pull
docker-compose -f docker-compose.n8n.yml restart
```

---

## 🧪 Testing Your Setup

### Test 1: Check Python

```bash
python3 --version
# Should show Python 3.x
```

### Test 2: Check Chrome

```bash
chromium-browser --version
# OR
google-chrome --version
```

### Test 3: Check ChromeDriver

```bash
chromedriver --version
```

### Test 4: Run Scraper Manually

```bash
cd /opt/AI-Video-SaaS
python3 scrape_airtable_n8n.py
```

Expected output:
```json
{
  "success": true,
  "count": 42,
  "scraped_at": "2025-12-22T...",
  "method": "selenium",
  "data": [...]
}
```

### Test 5: Run in n8n

1. Create workflow with Execute Command node
2. Run it
3. Check execution output

---

## 📋 Ready-to-Import n8n Workflow

Copy this workflow JSON and import it into n8n:

**Workflows → Import from File** or paste this:

```json
{
  "name": "Airtable Scraper",
  "nodes": [
    {
      "parameters": {},
      "name": "When clicking 'Test workflow'",
      "type": "n8n-nodes-base.manualTrigger",
      "typeVersion": 1,
      "position": [240, 300]
    },
    {
      "parameters": {
        "command": "python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py",
        "additionalFields": {
          "env": {
            "envVars": [
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
      "position": [460, 300]
    },
    {
      "parameters": {
        "jsCode": "// Parse the scraper output\nconst output = JSON.parse($input.item.json.stdout);\n\n// Check for errors\nif (!output.success) {\n  throw new Error(`Scraping failed: ${output.error}`);\n}\n\n// Log success\nconsole.log(`✅ Successfully scraped ${output.count} rows`);\nconsole.log(`Method: ${output.method}`);\nconsole.log(`Time: ${output.scraped_at}`);\n\n// Return each row as a separate n8n item\nreturn output.data.map(row => ({\n  json: row\n}));"
      },
      "name": "Parse & Split Data",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [680, 300]
    }
  ],
  "connections": {
    "When clicking 'Test workflow'": {
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
            "node": "Parse & Split Data",
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

## 🔧 Troubleshooting

### "Command not found: python3"

```bash
# Find Python
which python3

# Use full path in Execute Command node
/usr/bin/python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py
```

### "No module named 'selenium'"

```bash
# Install for root
sudo pip3 install selenium

# Or install for all users
sudo pip3 install --system selenium
```

### "ChromeDriver not found"

```bash
# Ubuntu/Debian
sudo apt-get install chromium-chromedriver

# Verify
which chromedriver
```

### "Display not found"

Make sure `HEADLESS=true` in your Execute Command node environment variables.

### Permission denied

```bash
sudo chmod +x /opt/AI-Video-SaaS/scrape_airtable_n8n.py
sudo chown -R $(whoami) /opt/AI-Video-SaaS
```

### Timeout errors

In Execute Command node, add:
- Timeout: 120000 (2 minutes)

---

## 🎯 Next Steps

Once working, you can:

1. **Schedule it** - Use Cron or Schedule Trigger in n8n
2. **Add outputs** - Save to Google Sheets, Database, etc.
3. **Error handling** - Add error notification nodes
4. **Multiple tables** - Loop through multiple Airtable URLs
5. **Monitor** - Set up alerts for failures

---

## 💡 Pro Tips

### Tip 1: Cache Results

If scraping frequently, cache results to avoid rate limits:

```bash
python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py > /tmp/airtable_cache.json
```

### Tip 2: Run in Background

For long scrapes, run in background:

```bash
nohup python3 /opt/AI-Video-SaaS/scrape_airtable_n8n.py &
```

### Tip 3: Update Easily

Pull latest changes without restarting n8n:

```bash
cd /opt/AI-Video-SaaS
git pull
```

### Tip 4: Multiple Tables

Create an array of URLs in n8n and loop through them.

### Tip 5: Monitor Resource Usage

```bash
# Check CPU/Memory
htop

# Monitor Chrome processes
ps aux | grep chrome
```

---

## 📊 Performance

**Typical scraping time:**
- Small table (<100 rows): 5-15 seconds
- Medium table (100-1000 rows): 15-60 seconds
- Large table (1000+ rows): 1-3 minutes

**Resource usage:**
- RAM: ~300-500MB per scrape
- CPU: Moderate during scraping, idle otherwise

---

## 🆚 Why This Is Better Than Railway/Render

| Feature | Self-Hosted | Railway/Render API |
|---------|-------------|-------------------|
| Speed | ⚡ Faster (local) | Slower (network) |
| Cost | Server cost only | Free tier limits |
| Control | Full control | Limited |
| Complexity | Install deps once | Deploy & maintain API |
| Privacy | Data stays on your server | Data passes through API |

**Verdict:** Self-hosted is better if you already have the infrastructure!

---

## Need Help?

1. Check n8n execution logs
2. Run scraper manually to test
3. Check server logs: `journalctl -u n8n -f`
4. Docker logs: `docker-compose logs -f n8n`
