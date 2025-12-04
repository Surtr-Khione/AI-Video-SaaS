# How to Get API Keys

## Option 1: Podcast Index (Recommended - FREE FOREVER)

### Step 1: Visit the Website
Go to: **https://podcastindex.org/**

### Step 2: Get API Key
1. Click **"Developers"** in the top menu
2. Click **"Get API Key"** button
3. Fill out the form:
   - **Name:** Your name
   - **Email:** Your email
   - **Reason:** "Podcast advertising research" or "Testing podcast analyzer"
4. Click **Submit**

### Step 3: Receive Keys
- You'll get an email **instantly** with:
  - `API Key` (looks like: `ABCD1234EFGH5678`)
  - `API Secret` (looks like: `abcdefgh12345678ijklmnop`)

### Step 4: Add to .env File
```bash
# Open .env file
nano .env

# Add these lines:
PODCAST_INDEX_API_KEY=your_api_key_here
PODCAST_INDEX_API_SECRET=your_api_secret_here
```

**That's it!** ✅

---

## Option 2: Listen Notes (Optional - Free Tier Available)

### Step 1: Visit the Website
Go to: **https://www.listennotes.com/api/**

### Step 2: Sign Up
1. Click **"Get Started"** or **"Sign Up"**
2. Create an account (email + password)
3. Verify your email

### Step 3: Get API Key
1. Go to your dashboard
2. Copy your API key (looks like: `abc123def456...`)
3. **Free tier:** 100 requests/month

### Step 4: Add to .env File
```bash
# Open .env file
nano .env

# Add this line:
LISTEN_NOTES_API_KEY=your_api_key_here
```

---

## Complete .env File Example

Your `.env` file should look like this:

```bash
# Podcast Index API (FREE - Recommended)
PODCAST_INDEX_API_KEY=ABCD1234EFGH5678
PODCAST_INDEX_API_SECRET=abcdefgh12345678ijklmnop

# Listen Notes API (OPTIONAL)
LISTEN_NOTES_API_KEY=abc123def456ghi789jkl012
```

---

## Quick Setup Script

Run this to automatically set up your .env file:

```bash
#!/bin/bash
echo "Setting up .env file..."

read -p "Enter Podcast Index API Key: " PI_KEY
read -p "Enter Podcast Index API Secret: " PI_SECRET

cat > .env << EOF
# Podcast Index API
PODCAST_INDEX_API_KEY=$PI_KEY
PODCAST_INDEX_API_SECRET=$PI_SECRET

# Listen Notes API (optional)
LISTEN_NOTES_API_KEY=
EOF

echo "✅ .env file created!"
echo "You can now run: python podcast_analyzer.py -n 'technology' -b 5000"
```

Save as `setup_keys.sh` and run:
```bash
chmod +x setup_keys.sh
./setup_keys.sh
```

---

## Test Your API Keys

After adding keys, test them:

```bash
python -c "
import os
from dotenv import load_dotenv
load_dotenv()

pi_key = os.getenv('PODCAST_INDEX_API_KEY')
pi_secret = os.getenv('PODCAST_INDEX_API_SECRET')

if pi_key and pi_secret:
    print('✅ Podcast Index API keys found!')
else:
    print('❌ Podcast Index API keys missing')
"
```

Or just run the tool:
```bash
python podcast_analyzer.py -n "technology" -b 5000
```

If keys work, you'll see:
```
✓ Podcast Index API initialized
```

---

## Which API Should I Use?

### Podcast Index (Recommended)
- ✅ **FREE forever**
- ✅ 10,000 requests/day
- ✅ Instant approval
- ✅ No credit card needed
- ✅ Great for testing and production

### Listen Notes
- ✅ Good for additional data
- ⚠️ 100 requests/month (free tier)
- ⚠️ Paid plans for more
- ℹ️ Optional - use as backup

**Recommendation:** Start with Podcast Index only. It's free and has everything you need!

---

## Troubleshooting

### "No API keys configured" Warning
- Check `.env` file exists in project root
- Check keys are spelled correctly
- No quotes around keys needed
- No spaces around `=` sign

### "Invalid API key" Error
- Double-check you copied keys correctly
- Make sure you're using Podcast Index, not another service
- Check email for correct keys

### Still Not Working?
1. Delete `.env` file
2. Copy `.env.example` to `.env`
3. Manually paste keys
4. Run: `python podcast_analyzer.py -n "test" -b 5000`

---

## API Rate Limits

### Podcast Index
- **Limit:** 10,000 requests per day
- **Typical usage:** 1-5 requests per search
- **You can analyze:** 2,000+ niches per day
- **Resets:** Daily

### Listen Notes (Free Tier)
- **Limit:** 100 requests per month
- **Typical usage:** 1 request per search
- **You can analyze:** 100 searches per month
- **Resets:** Monthly

---

## Test Without API Keys

Don't want to set up keys yet? Use demo mode:

```bash
python demo.py
```

This works immediately with sample data!

---

## Security Note

⚠️ **Keep your API keys private!**

- Never commit `.env` to git (already in `.gitignore`)
- Don't share keys publicly
- Don't post them in issues/forums
- Regenerate if accidentally exposed

The `.env` file is automatically ignored by git for your security.

---

## Next Steps

1. ✅ Get Podcast Index API key (2 minutes)
2. ✅ Add to `.env` file
3. ✅ Run: `python podcast_analyzer.py -n "your niche" -b 5000`
4. ✅ Get real podcast data and analysis!

---

**Quick Links:**
- Podcast Index: https://podcastindex.org/
- Listen Notes: https://www.listennotes.com/api/
- Tool Help: `python podcast_analyzer.py --help`
