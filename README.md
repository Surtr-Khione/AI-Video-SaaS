# AI-Video-SaaS

AI Video SaaS with Airtable integration for data management.

## Airtable Weekly Scraper

A simple Python script that automatically scrapes an Airtable table every Monday morning at 9:00 AM.

### Features

- 🔄 Automatically fetches all records from your Airtable table
- 📅 Runs every Monday at 9:00 AM
- 💾 Saves data as JSON files with timestamps
- 🔐 Secure configuration using environment variables
- 📝 Clean and simple code

### Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Airtable credentials:
   - `AIRTABLE_API_KEY`: Your Airtable API key (found in Account settings)
   - `AIRTABLE_BASE_ID`: Your Airtable base ID (from the URL)
   - `AIRTABLE_TABLE_NAME`: Name of the table to scrape
   - `OUTPUT_DIR`: Directory to save scraped data (default: `data`)

3. **Run the scraper:**
   ```bash
   python airtable_scraper.py
   ```

### How It Works

1. The script runs an initial scrape when started
2. Then schedules weekly scrapes every Monday at 9:00 AM
3. Each scrape fetches all records from your Airtable table
4. Data is saved as JSON in the `data/` directory with timestamps
5. Files are named: `airtable_data_YYYYMMDD_HHMMSS.json`

### Running in Production

For production use, run the script as a background service:

**Using systemd (Linux):**
Create a service file at `/etc/systemd/system/airtable-scraper.service`

**Using Docker:**
```dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY airtable_scraper.py .
COPY .env .
CMD ["python", "airtable_scraper.py"]
```

**Using cron:**
Alternatively, you can use cron for scheduling instead of the built-in scheduler.

### Configuration

All configuration is done via environment variables in the `.env` file:

| Variable | Description | Required |
|----------|-------------|----------|
| `AIRTABLE_API_KEY` | Your Airtable API key | Yes |
| `AIRTABLE_BASE_ID` | Your Airtable base ID | Yes |
| `AIRTABLE_TABLE_NAME` | Table name to scrape | Yes |
| `OUTPUT_DIR` | Output directory for data | No (default: `data`) |

### Output Format

Scraped data is saved as JSON with the following structure:
```json
[
  {
    "id": "rec123...",
    "fields": {
      "field1": "value1",
      "field2": "value2"
    },
    "createdTime": "2024-01-01T00:00:00.000Z"
  }
]
```

### License

MIT
