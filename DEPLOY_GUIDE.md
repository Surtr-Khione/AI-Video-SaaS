# Quick Deployment Guide for Cloud n8n

Since cloud-hosted n8n can't run browsers, you need to deploy the Flask API to a cloud service.

## ⚡ Quick Deploy to Railway (Recommended - 5 Minutes)

### Step 1: Deploy the API

1. **Go to https://railway.app**
   - Sign in with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository: `Surtr-Khione/AI-Video-SaaS`
   - Select the branch: `claude/scrape-airtable-table-k9NMs`

3. **Configure Environment Variables**

   Click on your service → Variables → Add these:
   ```
   API_KEY=mysecretkey123
   AIRTABLE_URL=https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT
   PORT=5000
   HEADLESS=true
   ```

   **Important:** Save the API_KEY - you'll need it in n8n!

4. **Get Your URL**

   Railway will deploy and give you a URL like:
   ```
   https://your-app-name.up.railway.app
   ```

   **Copy this URL!**

5. **Test It**

   Visit: `https://your-app-name.up.railway.app/health`

   You should see:
   ```json
   {
     "status": "healthy",
     "timestamp": "2025-12-22T..."
   }
   ```

### Step 2: Configure n8n

1. **In your cloud n8n, create a new workflow**

2. **Add these nodes:**

   **Node 1: Schedule Trigger** (optional)
   - Schedule: `0 9 * * *` (daily at 9am)
   - Or use Manual Trigger for testing

   **Node 2: HTTP Request**
   ```
   Method: POST
   URL: https://your-app-name.up.railway.app/scrape

   Authentication: None (we'll use headers)

   Send Headers: Yes
   Headers:
     X-API-Key: mysecretkey123
     Content-Type: application/json

   Send Body: Yes
   Body Content Type: JSON
   JSON:
   {
     "recent_days": 30
   }

   Options:
     Timeout: 60000
   ```

   **Node 3: Code (JavaScript)**
   ```javascript
   const response = $input.item.json;

   if (!response.success) {
     throw new Error(`Error: ${response.error}`);
   }

   console.log(`✓ Scraped ${response.count} rows`);

   return response.data.map(row => ({ json: row }));
   ```

3. **Test the workflow**
   - Click "Execute Workflow"
   - You should see your Airtable data!

4. **Add output nodes** (optional)
   - Google Sheets
   - Airtable
   - Database
   - Webhook
   - etc.

---

## 🎯 Alternative: Deploy to Render

If Railway doesn't work, use Render (also free):

1. **Go to https://render.com**
   - Sign in with GitHub

2. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub account
   - Select repository: `Surtr-Khione/AI-Video-SaaS`
   - Branch: `claude/scrape-airtable-table-k9NMs`

3. **Configure Service**
   ```
   Name: airtable-scraper
   Environment: Docker
   Dockerfile Path: ./Dockerfile

   Environment Variables:
   API_KEY=mysecretkey123
   AIRTABLE_URL=https://airtable.com/appk7qdCSlKGMnWbM/shrCf8aQnC4ke06ks/tblwo1OgfwmbaAyBT
   PORT=5000
   ```

4. **Create Web Service**
   - Wait for deployment (3-5 minutes)
   - Get your URL: `https://airtable-scraper-xyz.onrender.com`

5. **Use in n8n** (same as Railway setup above)

---

## 📋 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `API_KEY` | Yes | Secret key for API authentication | `mysecretkey123` |
| `AIRTABLE_URL` | No* | Default Airtable URL | `https://airtable.com/app.../shr.../tbl...` |
| `PORT` | No | Server port (Railway auto-sets this) | `5000` |
| `HEADLESS` | No | Run browser headless | `true` |

*If not set, you must provide `url` in the request body

---

## 🧪 Testing Your Deployment

### Test with cURL:

```bash
curl -X POST https://your-app.up.railway.app/scrape \
  -H "X-API-Key: mysecretkey123" \
  -H "Content-Type: application/json" \
  -d '{"recent_days": 30}'
```

### Expected Response:

```json
{
  "success": true,
  "count": 42,
  "scraped_at": "2025-12-22T10:30:00",
  "method": "selenium",
  "data": [
    {
      "Column1": "value1",
      "Column2": "value2",
      ...
    },
    ...
  ]
}
```

---

## 🔧 Troubleshooting

### "Unauthorized" Error
- Check that `X-API-Key` header matches the `API_KEY` environment variable
- Make sure there are no extra spaces in the key

### "URL is required" Error
- Set `AIRTABLE_URL` environment variable in Railway/Render
- OR include `"url": "..."` in your request body

### Timeout Errors
- Increase timeout in n8n HTTP Request node to 60000ms (60 seconds)
- Check Railway logs to see if the scraper is actually running

### No Data Returned
- Verify the Airtable URL is a public shared view
- Check that the URL starts with `shr` (shared view ID)
- Look at Railway logs for detailed error messages

### View Railway Logs
- Go to your Railway project
- Click on your service
- Click "Deployments" → "View Logs"

---

## 💰 Pricing

**Railway Free Tier:**
- $5 credit per month
- Enough for ~500 scraping requests/month
- Perfect for testing and light usage

**Render Free Tier:**
- Free forever for web services
- Services sleep after 15 minutes of inactivity
- Takes ~30 seconds to wake up on first request

**Recommendation:** Start with Render's free tier. Upgrade to Railway if you need faster response times.

---

## 🚀 Production Tips

1. **Set up monitoring**
   - Use Railway's built-in metrics
   - Add health check endpoint to n8n workflow

2. **Secure your API key**
   - Use n8n's credentials feature to store API_KEY
   - Never commit API keys to git

3. **Handle rate limits**
   - Add delay between scraping runs
   - Don't scrape more than once per minute

4. **Error handling**
   - Add error handling nodes in n8n
   - Set up alerts for failures

5. **Logging**
   - Check Railway/Render logs regularly
   - Look for patterns in errors

---

## 📞 Need Help?

1. Check Railway/Render logs for errors
2. Test the `/health` endpoint
3. Verify environment variables are set correctly
4. Check n8n execution logs
