# 🎙️ Podcast Growth Analyzer

A powerful tool that identifies high-growth podcasts in your niche, analyzes their advertising prices, and determines if they're a good investment for your marketing budget.

## Features

- 🔍 **Niche Search**: Find podcasts in any industry or niche
- 📈 **Growth Velocity Analysis**: Identify podcasts with explosive growth
- 💰 **Advertising Price Estimation**: Calculate CPM and ad slot pricing
- ⭐ **Investment Scoring**: Get data-driven recommendations (BUY/HOLD/AVOID)
- 📊 **ROI Projections**: Estimate conversions and cost-per-acquisition
- 📝 **Comprehensive Reports**: Detailed analysis of each opportunity

## How It Works

The tool uses a sophisticated multi-factor analysis:

1. **Growth Velocity (35%)**: Analyzes episode frequency, publishing consistency, and growth acceleration
2. **Audience Size (20%)**: Evaluates current reach and listener base
3. **Cost Efficiency (25%)**: Calculates CPM and budget fit
4. **Niche Value (10%)**: Considers advertising value of the niche
5. **Consistency (10%)**: Measures reliability for ongoing campaigns

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/AI-Video-SaaS.git
cd AI-Video-SaaS
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up API keys (copy `.env.example` to `.env` and add your keys):
```bash
cp .env.example .env
# Edit .env with your API keys
```

### API Keys (Optional but Recommended)

- **Podcast Index API**: Get free API keys at [podcastindex.org](https://podcastindex.org/)
- **Listen Notes API**: Get API keys at [listennotes.com/api](https://www.listennotes.com/api/)

The tool can run in demo mode without API keys, but will have limited data.

## Usage

### Basic Usage

Search for podcasts in a niche with your budget:

```bash
python podcast_analyzer.py -n "artificial intelligence" -b 5000
```

### Advanced Options

```bash
python podcast_analyzer.py \
  --niche "business" \
  --budget 10000 \
  --min-velocity 70 \
  --max-results 20 \
  --detailed
```

### Command Line Arguments

| Argument | Short | Description | Default |
|----------|-------|-------------|---------|
| `--niche` | `-n` | Niche/industry to search | Required |
| `--budget` | `-b` | Monthly budget in USD | 5000 |
| `--min-velocity` | `-m` | Min growth velocity score (0-100) | 60 |
| `--max-results` | `-r` | Max podcasts to analyze | 20 |
| `--detailed` | `-d` | Show detailed reports | False |
| `--top` | | Number of top results to show | 10 |

## Example Output

```
================================================================================
🎙️  PODCAST GROWTH ANALYZER
================================================================================
Niche: artificial intelligence
Budget: $5,000.00/month
Min Velocity: 60
================================================================================

✓ Found 20 podcasts

📈 Analyzing growth velocity (minimum score: 60)...
✓ Identified 8 high-growth podcasts

💯 Scoring investment potential...

================================================================================
📊 TOP 5 INVESTMENT OPPORTUNITIES
================================================================================

+-----+------------------------------------------+--------+--------+------------------+---------------+------------+
|   # | Podcast                                  | Score  | Grade  | Recommendation   | Monthly Cost  | Listeners  |
+=====+==========================================+========+========+==================+===============+============+
|   1 | AI Daily Insights                        | 87.3   | A      | STRONG BUY       | $3,200        | 45,000     |
+-----+------------------------------------------+--------+--------+------------------+---------------+------------+
|   2 | The ML Engineer Podcast                  | 82.1   | A-     | STRONG BUY       | $4,100        | 38,000     |
+-----+------------------------------------------+--------+--------+------------------+---------------+------------+
|   3 | Future of AI                             | 76.8   | B+     | BUY              | $2,800        | 28,000     |
+-----+------------------------------------------+--------+--------+------------------+---------------+------------+
```

## Understanding the Scores

### Investment Grades

- **A+/A (90-100)**: Exceptional opportunity - Strong Buy
- **A-/B+ (75-89)**: Great opportunity - Strong Buy
- **B/B- (65-74)**: Good opportunity - Buy
- **C (50-64)**: Moderate opportunity - Consider
- **D (<50)**: Poor opportunity - Avoid

### Growth Trends

- **Explosive**: 75+ velocity score - Rapid growth
- **High**: 60-75 velocity score - Strong growth
- **Moderate**: 40-60 velocity score - Steady growth
- **Slow**: 20-40 velocity score - Minimal growth
- **Stagnant**: <20 velocity score - No growth

## Example Use Cases

### 1. Finding Growth Opportunities in Tech

```bash
python podcast_analyzer.py -n "technology startups" -b 8000 -m 65 --detailed
```

Perfect for SaaS companies looking to advertise on emerging tech podcasts.

### 2. Budget-Conscious Marketing

```bash
python podcast_analyzer.py -n "small business" -b 2000 -m 50
```

Find affordable podcasts that still have growth potential.

### 3. Premium Placement Search

```bash
python podcast_analyzer.py -n "finance investing" -b 20000 -m 75 --top 5
```

Identify top-tier, high-growth finance podcasts for premium campaigns.

## Project Structure

```
AI-Video-SaaS/
├── podcast_analyzer.py          # Main CLI tool
├── requirements.txt              # Python dependencies
├── .env.example                  # Example environment variables
├── src/
│   ├── api/
│   │   ├── podcast_index.py     # Podcast Index API integration
│   │   └── listen_notes.py      # Listen Notes API integration
│   ├── analysis/
│   │   ├── growth_analyzer.py   # Growth velocity analysis
│   │   └── ad_pricing.py        # Advertising price estimation
│   └── scoring/
│       └── investment_scorer.py  # Investment scoring algorithm
└── README.md
```

## Methodology

### Growth Velocity Analysis

The growth analyzer examines:
- Episode publishing frequency
- Publishing consistency
- Recent acceleration in output
- Trending scores
- Episode count trajectory

### Pricing Estimation

Advertising prices are estimated based on:
- Industry-standard CPM ranges ($15-100)
- Audience size (micro to mega)
- Niche premium multipliers
- Ad placement types (pre/mid/post-roll)
- Market research data

### Investment Scoring

The scoring algorithm weighs:
1. **Growth Velocity (35%)**: Future potential
2. **Cost Efficiency (25%)**: ROI potential
3. **Audience Size (20%)**: Current reach
4. **Niche Value (10%)**: Market value
5. **Consistency (10%)**: Campaign reliability

## Limitations

- Listener counts are estimated (unless provided by API)
- Pricing is based on industry benchmarks
- ROI projections use average conversion rates (2% CTR, 5% conversion)
- Some podcasts may not have enough data for accurate analysis

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - Feel free to use this tool for your marketing research!

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built with ❤️ for marketers and podcast advertisers
