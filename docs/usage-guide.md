# Usage Guide - AI Video Prompt Library

## Getting Started

### Installation

```bash
# Clone the repository
git clone https://github.com/Surtr-Khione/AI-Video-SaaS.git
cd AI-Video-SaaS

# Install dependencies (optional, for utilities)
npm install
```

### Quick Start

1. **Browse available prompts:**
   ```bash
   node utils/list-prompts.js
   ```

2. **View a specific prompt:**
   ```bash
   cat prompts/saas/crm-sales-acceleration.json
   ```

3. **Validate a prompt:**
   ```bash
   node utils/prompt-validator.js prompts/saas/crm-sales-acceleration.json
   ```

## Using Prompts

### Method 1: Direct Copy

1. Open a prompt file (e.g., `prompts/saas/crm-sales-acceleration.json`)
2. Copy the `prompt.main` field
3. Paste into your AI video generation tool
4. Customize with your product details
5. Generate!

### Method 2: Programmatic Use

```javascript
const fs = require('fs');

// Load prompt
const prompt = JSON.parse(
  fs.readFileSync('prompts/saas/crm-sales-acceleration.json', 'utf8')
);

// Access different parts
const mainPrompt = prompt.prompt.main;
const storyboard = prompt.script.storyboard;
const voiceover = prompt.script.fullVoiceover;

// Customize
const customPrompt = mainPrompt
  .replace('[CRM Name]', 'YourCRM Pro')
  .replace('[Product]', 'YourCRM Pro');

// Use with your video generation API
```

## Customization Guide

### Basic Customization

Replace these placeholders in any prompt:

- `[Product Name]` → Your product name
- `[CRM Name]` / `[App Name]` → Your specific product
- Generic metrics → Your actual metrics
- Generic features → Your actual features

### Example:

**Original:**
```
"Create a 60-second demo for [Product]..."
```

**Customized:**
```
"Create a 60-second demo for SalesForce Pro..."
```

### Advanced Customization

#### 1. Adjust Duration

If you need a 30-second version instead of 60-second:

- Cut scenes proportionally
- Focus on top 3 features only
- Simplify the problem/solution sections
- Keep the same emotional arc

#### 2. Change Platform

For Instagram Stories (9:16):
```json
{
  "technicalSpecs": {
    "aspectRatio": "9:16",
    "resolution": "1080x1920"
  },
  "visualGuidelines": [
    "Vertical format",
    "Large, readable text",
    "Subtitles always visible",
    "Fast cuts (2-3s per scene)"
  ]
}
```

#### 3. Modify Framework

Switch from PRS to FBTD:

**Original (PRS):**
- Problem → Reaction → Solution

**Modified (FBTD):**
- Feature 1 → Benefit → Tie Down
- Feature 2 → Benefit → Tie Down
- Feature 3 → Benefit → Tie Down

Use the framework guides in `/frameworks/` for detailed instructions.

## Filtering & Search

### By Category

```bash
# SaaS prompts only
node utils/list-prompts.js --category=saas

# Mobile app prompts
node utils/list-prompts.js --category=mobile-apps

# Developer tools
node utils/list-prompts.js --category=developer-tools
```

### By Framework

```bash
# Problem-Reaction-Solution
node utils/list-prompts.js --framework=problem-reaction-solution

# Feature-Benefit-Tie Down
node utils/list-prompts.js --framework=feature-benefit-tiedown

# Save the Cat
node utils/list-prompts.js --framework=save-the-cat
```

### By Duration

```bash
# 60-second videos
node utils/list-prompts.js --duration=60s

# 90-second videos
node utils/list-prompts.js --duration=90s
```

### View Statistics

```bash
node utils/list-prompts.js --stats
```

## Best Practices

### 1. Start with the Right Framework

| Situation | Best Framework | Example Prompt |
|-----------|---------------|----------------|
| Clear pain point exists | PRS | CRM Sales Acceleration |
| Multiple features to show | FBTD | Project Management |
| Emotional transformation story | Save the Cat | Analytics Insights |

### 2. Match Video Length to Platform

| Platform | Duration | Key Considerations |
|----------|----------|-------------------|
| TikTok/Instagram Reels | 15-30s | Hook in first 3s, vertical format |
| LinkedIn | 45-90s | Professional tone, value-focused |
| YouTube | 60-120s | Can be detailed, educational |
| Website Hero | 30-60s | Auto-play compatible, muted OK |

### 3. Customize Thoughtfully

**Don't just find/replace:**
- ❌ "[Product] helps you work faster"
- ✅ "TaskMaster's AI prioritization helps marketing teams ship campaigns 3x faster"

**Be specific:**
- ❌ "Save time"
- ✅ "Save 15 hours per week on manual reporting"

**Use real metrics:**
- ❌ "Increase productivity"
- ✅ "Teams complete projects 67% faster"

### 4. Test and Iterate

1. Create 3 variations with different hooks
2. Test with small audience
3. Measure: completion rate, CTA clicks, shares
4. Double down on winner
5. Iterate based on feedback

## Common Workflows

### Workflow 1: Product Launch Video

```bash
# 1. Find relevant prompt
node utils/list-prompts.js --category=saas

# 2. Validate the prompt
node utils/prompt-validator.js prompts/saas/crm-sales-acceleration.json

# 3. Customize for your product
# Edit the JSON or extract prompt.main

# 4. Generate video using AI tool

# 5. Review storyboard for manual production
# Use script.storyboard for scene-by-scene guidance
```

### Workflow 2: Multi-Platform Campaign

```bash
# Start with one base prompt
BASE=prompts/saas/project-management-collaboration.json

# Create variations:
# - 60s LinkedIn version (16:9)
# - 30s Instagram Feed (1:1)
# - 15s Instagram Stories (9:16)
# - 90s YouTube version (16:9)

# Adjust each for platform:
# - Duration
# - Aspect ratio
# - Pacing
# - Text size/readability
```

### Workflow 3: A/B Testing

```bash
# Create 2 versions with different hooks

# Version A: Problem-focused hook
"Your sales reps are spending 4 hours a day on admin work..."

# Version B: Aspiration-focused hook
"What if you could close 3x more deals with the same team?"

# Run both, measure performance
# Iterate on winner
```

## Integration with AI Video Tools

### Example: Using with RunwayML

```javascript
const prompt = require('./prompts/saas/crm-sales-acceleration.json');

const runwayConfig = {
  prompt: prompt.prompt.main,
  duration: prompt.metadata.duration,
  aspectRatio: prompt.technicalSpecs.aspectRatio,
  style: prompt.style.tone
};

// Send to Runway API
```

### Example: Using with Synthesia

```javascript
const prompt = require('./prompts/mobile-apps/fitness-tracking-app.json');

const synthesiaConfig = {
  script: prompt.script.fullVoiceover,
  scenes: prompt.script.storyboard.map(scene => ({
    duration: scene.duration,
    visual: scene.visual,
    narration: scene.voiceover
  }))
};

// Send to Synthesia API
```

## Troubleshooting

### "Prompt too long for my tool"

**Solution:** Use condensed versions
- Use `prompt.opening`, `prompt.middle`, `prompt.closing` separately
- Focus on key scenes from storyboard
- Reduce feature count (3-5 max)

### "Doesn't match my product category"

**Solution:** Cross-apply frameworks
- Use the framework guide (e.g., PRS) from `/frameworks/`
- Apply structure to your specific product
- Reference multiple prompts for inspiration

### "Need different tone/style"

**Solution:** Modify `style` and `visualGuidelines`
- Change `tone`: cinematic → professional
- Adjust pacing: fast → medium
- Update visual guidelines for your brand

### "Validation failing"

```bash
node utils/prompt-validator.js your-prompt.json
```

Check:
- Required fields present
- Valid JSON format
- Framework matches allowed list
- Metadata complete

## Contributing

Want to add your own prompts?

1. Copy an existing prompt as template
2. Follow the schema in `prompts/schema.json`
3. Include complete storyboard
4. Validate: `node utils/prompt-validator.js your-prompt.json`
5. Test with actual video generation
6. Submit pull request

## Resources

- **Frameworks:** See `/frameworks/` for detailed guides
- **Schema:** `prompts/schema.json` for structure reference
- **Examples:** All prompts include real-world inspirations

## Support

Questions or issues? Open an issue on GitHub!

Happy video creating! 🎬
