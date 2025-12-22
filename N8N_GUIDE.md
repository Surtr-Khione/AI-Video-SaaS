# Using Airtable Scraper with n8n

This guide shows you how to integrate the Airtable scraper with n8n workflows.

## Table of Contents

- [Quick Start](#quick-start)
- [Method 1: HTTP Request Node (Recommended)](#method-1-http-request-node-recommended)
- [Method 2: Execute Command Node](#method-2-execute-command-node)
- [Docker Deployment](#docker-deployment)
- [Example Workflows](#example-workflows)
- [Troubleshooting](#troubleshooting)

## Quick Start

### Option A: Using Docker Compose (Easiest)

```bash
# 1. Set up environment variables
cp .env.example .env
# Edit .env with your settings

# 2. Start both the scraper API and n8n
docker-compose up -d

# 3. Access n8n at http://localhost:5678
# Default credentials: admin / changeme

# 4. The scraper API is available at http://airtable-scraper:5000
```

### Option B: Manual Setup

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the API server
python api_server.py

# 3. Install and run n8n separately
npx n8n
```

## Method 1: HTTP Request Node (Recommended)

This method uses the Flask API server and n8n's HTTP Request node.

### Step 1: Start the API Server

```bash
# Set your API key
export API_KEY=your-secret-api-key

# Set default Airtable URL (optional)
export AIRTABLE_URL=https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT

# Start the server
python api_server.py
```

The API will be available at `http://localhost:5000`

### Step 2: Configure n8n HTTP Request Node

1. Add an **HTTP Request** node to your workflow
2. Configure it as follows:

**Method:** POST
**URL:** `http://localhost:5000/scrape` (or `http://airtable-scraper:5000/scrape` if using Docker)

**Authentication:** Add Header Auth
- **Header Name:** `X-API-Key`
- **Header Value:** `your-secret-api-key`

**Body (JSON):**
```json
{
  "url": "https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT",
  "method": "selenium",
  "recent_days": 30,
  "headless": true,
  "dedupe_fields": ["Name", "Email"]
}
```

### Step 3: Process the Response

Add a **Code** node after the HTTP Request to process the data:

```javascript
// Extract the data array from the response
const response = $input.item.json;

if (response.success) {
  // Return each row as a separate item
  return response.data.map(row => ({
    json: row
  }));
} else {
  throw new Error(`Scraping failed: ${response.error}`);
}
```

### API Endpoints

#### POST /scrape

Scrape an Airtable table with full configuration options.

**Headers:**
- `X-API-Key`: Your API key

**Body Parameters:**
```json
{
  "url": "string (required)",
  "method": "selenium|api (default: selenium)",
  "api_key": "string (optional, for Airtable API)",
  "dedupe_fields": ["field1", "field2"],
  "date_field": "string (default: createdTime)",
  "recent_days": 30,
  "headless": true
}
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 42,
  "scraped_at": "2025-12-22T10:30:00",
  "method": "selenium"
}
```

#### GET /scrape

Simple scraping with query parameters.

**Headers:**
- `X-API-Key`: Your API key

**Query Parameters:**
- `url`: Airtable URL (optional if set in env)
- `method`: `selenium` or `api`
- `recent_days`: Number of days to filter

**Example:**
```
GET http://localhost:5000/scrape?url=https://airtable.com/...&recent_days=30
```

#### GET /health

Health check endpoint (no auth required).

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-22T10:30:00"
}
```

## Method 2: Execute Command Node

This method directly runs the Python script without the API server.

### Step 1: Configure Environment

Set environment variables in n8n's Execute Command node:

```bash
AIRTABLE_URL=https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT
SCRAPE_METHOD=selenium
HEADLESS=true
RECENT_DAYS=30
DATE_FIELD=createdTime
DEDUPE_FIELDS=Name,Email
```

### Step 2: Execute Command

**Command:**
```bash
python3 /path/to/scrape_airtable_n8n.py
```

The script outputs JSON to stdout, which n8n can parse automatically.

### Step 3: Parse Output

Add a **Code** node to parse the JSON output:

```javascript
const output = JSON.parse($input.item.json.stdout);

if (output.success) {
  return output.data.map(row => ({ json: row }));
} else {
  throw new Error(`Scraping failed: ${output.error}`);
}
```

## Docker Deployment

### Using Docker Compose

The included `docker-compose.yml` sets up both the scraper API and n8n:

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Services:**
- **airtable-scraper**: API server on port 5000
- **n8n**: Workflow automation on port 5678

### Using Docker Only

```bash
# Build the image
docker build -t airtable-scraper .

# Run the container
docker run -d \
  -p 5000:5000 \
  -e API_KEY=your-secret-key \
  -e AIRTABLE_URL=https://airtable.com/... \
  --shm-size=2g \
  --name airtable-scraper \
  airtable-scraper

# Check health
curl http://localhost:5000/health
```

## Example Workflows

### 1. Basic Scraping Workflow

```
[Manual Trigger]
    → [HTTP Request: Scrape Airtable]
    → [Code: Process Results]
    → [Split Items]
    → [Do Something with Data]
```

### 2. Schedule Scraping + Save to Google Sheets

```
[Cron Trigger: Daily at 9am]
    → [HTTP Request: Scrape Airtable]
    → [Code: Process Results]
    → [Google Sheets: Append Rows]
    → [Slack: Send Notification]
```

### 3. Scrape + Dedupe + Filter + Store

```
[Webhook Trigger]
    → [HTTP Request: Scrape with deduplication]
    → [Code: Filter by criteria]
    → [MongoDB: Upsert]
    → [HTTP Response: Return count]
```

### 4. Multi-table Scraping

```
[Manual Trigger]
    → [Function: Define URLs]
    → [Split in Batches]
    → [HTTP Request: Scrape Each Table]
    → [Merge]
    → [Airtable: Create Records]
```

### Import Example Workflow

1. In n8n, go to **Workflows** → **Import from File**
2. Select `n8n_workflow_example.json`
3. Update the URLs and credentials
4. Activate the workflow

## Environment Variables

### API Server

| Variable | Description | Default |
|----------|-------------|---------|
| `API_KEY` | API key for authentication | `your-secret-api-key` |
| `PORT` | Server port | `5000` |
| `DEBUG` | Enable debug mode | `false` |
| `AIRTABLE_URL` | Default Airtable URL | - |
| `AIRTABLE_API_KEY` | Airtable API key (for API method) | - |

### Python Script

| Variable | Description | Default |
|----------|-------------|---------|
| `AIRTABLE_URL` | Airtable URL to scrape | Required |
| `SCRAPE_METHOD` | `selenium` or `api` | `selenium` |
| `HEADLESS` | Run browser headless | `true` |
| `RECENT_DAYS` | Filter to recent N days | - |
| `DATE_FIELD` | Field to use for date filtering | `createdTime` |
| `DEDUPE_FIELDS` | Comma-separated fields for deduplication | - |

## Troubleshooting

### API Returns 401 Unauthorized

**Problem:** API key is incorrect or missing.

**Solution:**
- Check the `X-API-Key` header is set correctly
- Verify the API_KEY environment variable matches

### Scraping Returns Empty Data

**Problem:** Selenium can't access the page or parse the table.

**Solution:**
- Verify the Airtable URL is a shared view (contains `shr`)
- Run with `headless: false` to see what's happening
- Check the container logs: `docker-compose logs airtable-scraper`

### Chrome/ChromeDriver Errors in Docker

**Problem:** Selenium can't find Chrome or ChromeDriver.

**Solution:**
- Increase shared memory: `--shm-size=2g`
- Ensure the Dockerfile installs chromium correctly
- Check logs for specific Chrome errors

### n8n Can't Connect to API

**Problem:** Network connectivity issue.

**Solution:**
- If using Docker Compose, use service name: `http://airtable-scraper:5000`
- If separate containers, ensure they're on the same network
- Check firewall settings

### Memory Issues with Selenium

**Problem:** Container crashes or freezes.

**Solution:**
- Increase container memory limits
- Increase shared memory: `--shm-size=2g`
- Use `headless: true` to reduce memory usage

## Advanced Usage

### Custom Deduplication Logic

```javascript
// In n8n Code node
const data = $input.item.json.data;

// Custom deduplication based on email + date
const seen = new Set();
const unique = data.filter(row => {
  const key = `${row.email}-${row.date}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

return unique.map(row => ({ json: row }));
```

### Parallel Multi-table Scraping

```javascript
// In n8n Code node - prepare URLs
const urls = [
  'https://airtable.com/app1/shr1/tbl1',
  'https://airtable.com/app2/shr2/tbl2',
  'https://airtable.com/app3/shr3/tbl3'
];

return urls.map(url => ({ json: { url } }));

// Then use Split in Batches + HTTP Request Loop
```

### Error Handling and Retry Logic

```javascript
// In n8n Code node
const MAX_RETRIES = 3;
let attempt = 0;
let result = null;

while (attempt < MAX_RETRIES && !result) {
  try {
    // Make scraping request
    const response = await $http.request({
      method: 'POST',
      url: 'http://localhost:5000/scrape',
      headers: { 'X-API-Key': 'your-key' },
      body: { url: $json.url }
    });

    if (response.success) {
      result = response;
    } else {
      attempt++;
      await new Promise(r => setTimeout(r, 2000 * attempt)); // Exponential backoff
    }
  } catch (error) {
    attempt++;
    if (attempt >= MAX_RETRIES) throw error;
    await new Promise(r => setTimeout(r, 2000 * attempt));
  }
}

return result.data.map(row => ({ json: row }));
```

## Best Practices

1. **Use API method when possible** - More reliable than Selenium for authenticated access
2. **Enable deduplication** - Prevents processing the same data multiple times
3. **Filter by date** - Use `recent_days` to only get new data
4. **Set up health checks** - Monitor the API with `/health` endpoint
5. **Use environment variables** - Keep URLs and keys out of workflows
6. **Implement error handling** - Always check `success` field in response
7. **Rate limit** - Add delays between requests to avoid overloading Airtable
8. **Log results** - Store scraping metadata for debugging
9. **Use Docker** - Easier deployment and consistency
10. **Monitor memory** - Selenium can be memory-intensive

## Support

For issues or questions:
- Check the main [README.md](README.md)
- Review [Troubleshooting](#troubleshooting) section
- Check n8n documentation: https://docs.n8n.io
- Check Airtable API docs: https://airtable.com/developers/web/api
