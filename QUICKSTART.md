# Quick Start Guide

Get started with the Podcast Growth Analyzer in 5 minutes!

## Option 1: Run Without API Keys (Demo Mode)

You can test the tool immediately without API keys:

```bash
# Install dependencies
pip install -r requirements.txt

# Run a demo search
python podcast_analyzer.py -n "technology" -b 5000
```

**Note**: Demo mode has limited data. For full functionality, set up API keys (see Option 2).

## Option 2: Full Setup with API Keys

### Step 1: Get API Keys (Free)

**Podcast Index API** (Recommended - Free Forever):
1. Visit https://podcastindex.org/
2. Click "Get API Key"
3. Fill out the form (instant approval)
4. You'll receive your API Key and Secret

**Listen Notes API** (Optional - Free Tier Available):
1. Visit https://www.listennotes.com/api/
2. Sign up for free account
3. Get your API key from dashboard

### Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env and add your API keys
nano .env  # or use your favorite editor
```

Your `.env` should look like:
```
PODCAST_INDEX_API_KEY=your_actual_api_key_here
PODCAST_INDEX_API_SECRET=your_actual_api_secret_here
LISTEN_NOTES_API_KEY=your_listen_notes_key_here
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4: Run Your First Analysis

```bash
python podcast_analyzer.py -n "artificial intelligence" -b 5000
```

## Example Searches by Industry

### Tech & SaaS
```bash
python podcast_analyzer.py -n "software development" -b 8000 -m 65
python podcast_analyzer.py -n "SaaS startups" -b 10000 --detailed
```

### Business & Marketing
```bash
python podcast_analyzer.py -n "digital marketing" -b 5000
python podcast_analyzer.py -n "entrepreneurship" -b 7500 -m 70
```

### Finance & Investing
```bash
python podcast_analyzer.py -n "crypto investing" -b 15000
python podcast_analyzer.py -n "personal finance" -b 3000 -m 50
```

### Health & Wellness
```bash
python podcast_analyzer.py -n "mental health" -b 6000
python podcast_analyzer.py -n "nutrition fitness" -b 4000
```

## Understanding Your Results

### The Summary Table

When you run the analyzer, you'll see a table with:
- **Score**: Overall investment score (0-100)
- **Grade**: Letter grade (A+ to D)
- **Recommendation**: BUY, CONSIDER, or AVOID
- **Monthly Cost**: Estimated advertising cost
- **Listeners**: Estimated audience size

### What to Look For

**Strong Buy Indicators:**
- Score > 80
- Grade A or A-
- "STRONG BUY" recommendation
- Monthly cost within your budget
- High listener count with strong growth

**Good Opportunities:**
- Score 65-80
- Grade B range
- "BUY" recommendation
- Reasonable cost-per-listener
- Consistent publishing schedule

**Consider Carefully:**
- Score 50-65
- Grade C range
- "CONSIDER" recommendation
- May require larger budget commitment

**Avoid:**
- Score < 50
- Grade D
- Poor growth metrics or too expensive

## Advanced Usage

### Get Detailed Reports

Add `--detailed` flag for comprehensive analysis:
```bash
python podcast_analyzer.py -n "machine learning" -b 10000 --detailed
```

This shows:
- Complete growth analysis
- Ad slot pricing breakdown
- ROI projections
- Budget fit analysis
- Key strengths and concerns

### Adjust Sensitivity

Lower the minimum velocity score to see more results:
```bash
# Default: only shows podcasts with 60+ velocity
python podcast_analyzer.py -n "business" -b 5000

# Show all podcasts with 40+ velocity
python podcast_analyzer.py -n "business" -b 5000 -m 40
```

### Analyze More Podcasts

Increase the search results:
```bash
# Analyze up to 50 podcasts
python podcast_analyzer.py -n "technology" -b 5000 -r 50
```

### Show More Top Results

Display top 15 instead of default 10:
```bash
python podcast_analyzer.py -n "marketing" -b 5000 --top 15
```

## Tips for Best Results

1. **Be Specific with Niches**: Instead of "business", try "B2B SaaS" or "e-commerce"
2. **Set Realistic Budgets**: Most podcasts cost $500-$5000/month for small-medium shows
3. **Look for Growth**: High velocity scores (70+) indicate rapid growth
4. **Check Consistency**: Podcasts that publish regularly are better for campaigns
5. **Consider Niche Premium**: Finance/Tech podcasts cost more but have higher-value audiences

## Troubleshooting

### "No podcasts found"
- Check your search term (try broader keywords)
- Verify API keys are correct in `.env`
- Try without API keys first (demo mode)

### "No high-growth podcasts found"
- Lower the `--min-velocity` threshold
- Try a different niche
- Increase `--max-results` to search more podcasts

### API Rate Limits
- Podcast Index: 10,000 requests/day (very generous)
- Listen Notes: 100-1000 requests/month depending on plan
- The tool respects rate limits automatically

## Next Steps

1. Run searches for your target niches
2. Review the detailed reports
3. Compare multiple podcast opportunities
4. Export results (manually copy from output)
5. Contact podcast hosts about advertising

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Open an issue on GitHub for bugs or feature requests
- Review the code in `/src` to understand how it works

Happy analyzing! 🎙️📈
