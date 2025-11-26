# AI Video SaaS - World's Best Product Demo Prompt Library

> A comprehensive, production-ready library of AI video prompts for creating world-class software and product demonstrations.

## 🎯 What Is This?

This is the most comprehensive prompt library for creating professional product demo videos using AI video generation tools. Each prompt is meticulously crafted using proven storytelling frameworks, includes complete metadata, and follows best practices from the world's top product demos.

**Perfect for:**
- SaaS companies launching new features
- Startups creating marketing videos
- Product marketers needing demo content
- Video production agencies
- AI video generation platforms
- Content creators making software demos

## 📚 Library Contents

### Prompt Categories

| Category | Prompts | Frameworks Used | Use Cases |
|----------|---------|-----------------|-----------|
| **SaaS Platforms** | 3 | PRS, FBTD, Save the Cat | CRM, Project Management, Analytics |
| **Mobile Apps** | 1 | PRS | Fitness & Health Apps |
| **Developer Tools** | 1 | FBTD | API Platforms, DevOps Tools |
| **E-commerce** | 1 | Save the Cat | Commerce Platforms, DTC Brands |
| **AI/ML Products** | 1 | PRS | MLOps, Data Science Tools |
| **Design Tools** | 1 | FBTD | UI/UX, Collaboration Tools |

### Storytelling Frameworks

Each prompt uses one of three proven frameworks:

1. **Problem-Reaction-Solution (PRS)** - Best for pain-point driven demos
2. **Feature-Benefit-Tie Down (FBTD)** - Best for feature-focused showcases
3. **Save the Cat** - Best for emotional, transformation-focused stories

Full framework documentation: [`/frameworks/`](./frameworks/)

## 🚀 Quick Start

### 1. Browse Prompts

```bash
# View all SaaS prompts
ls prompts/saas/

# View mobile app prompts
ls prompts/mobile-apps/

# View developer tool prompts
ls prompts/developer-tools/
```

### 2. Use a Prompt

Each JSON file contains everything you need:

```json
{
  "id": "unique-identifier",
  "name": "Human-readable name",
  "prompt": {
    "main": "Complete AI video generation prompt",
    "opening": "Opening scene details",
    "middle": "Core demonstration",
    "closing": "Closing and CTA"
  },
  "script": {
    "storyboard": [...],
    "fullVoiceover": "Complete narration script"
  },
  "metadata": {
    "targetAudience": [...],
    "keyFeatures": [...],
    "platforms": ["youtube", "linkedin", ...]
  }
}
```

### 3. Customize for Your Product

1. **Load the prompt** that matches your category
2. **Replace generic references** with your product name and features
3. **Adjust timing** based on your target platform
4. **Modify visuals** to match your brand guidelines
5. **Generate** using your AI video tool of choice

## 📖 Documentation

### Core Frameworks

#### 1. Problem-Reaction-Solution (PRS)

**Structure:**
- Problem (15-25%): Establish relatable pain point
- Reaction (10-15%): Show consequences and urgency
- Solution (60-70%): Present product as natural answer

**Best for:**
- B2B SaaS with clear pain points
- Tools replacing manual processes
- Productivity platforms
- Enterprise software

**Example prompts:**
- [`prompts/saas/crm-sales-acceleration.json`](./prompts/saas/crm-sales-acceleration.json)
- [`prompts/ai-ml/ml-model-deployment-platform.json`](./prompts/ai-ml/ml-model-deployment-platform.json)

[Full PRS Guide →](./frameworks/problem-reaction-solution.md)

#### 2. Feature-Benefit-Tie Down (FBTD)

**Structure:**
- Feature: "Product has X capability"
- Benefit: "Which means Y outcome for you"
- Tie Down: "That's valuable, isn't it?"

**Best for:**
- Product launches
- Feature announcements
- Sales presentations
- Comparison videos

**Example prompts:**
- [`prompts/saas/project-management-collaboration.json`](./prompts/saas/project-management-collaboration.json)
- [`prompts/developer-tools/api-platform-testing.json`](./prompts/developer-tools/api-platform-testing.json)
- [`prompts/design-tools/collaborative-design-platform.json`](./prompts/design-tools/collaborative-design-platform.json)

[Full FBTD Guide →](./frameworks/feature-benefit-tiedown.md)

#### 3. Save the Cat

**Structure (15 beats):**
- Opening Image → Theme → Set-Up → Catalyst
- → Debate → Break Into Two → Fun & Games
- → Midpoint → Finale → Final Image

**Best for:**
- Brand story videos
- Customer journey narratives
- Emotional, transformation-focused content
- Long-form demos (90s+)

**Example prompts:**
- [`prompts/saas/analytics-insights-platform.json`](./prompts/saas/analytics-insights-platform.json)
- [`prompts/ecommerce/headless-commerce-platform.json`](./prompts/ecommerce/headless-commerce-platform.json)

[Full Save the Cat Guide →](./frameworks/save-the-cat.md)

## 🎨 Prompt Anatomy

Every prompt includes:

### 1. Core Prompt
- **Main:** Complete AI video generation prompt
- **Opening:** First 5-10 seconds
- **Middle:** Core demonstration
- **Closing:** CTA and final message
- **Visual Guidelines:** Specific direction for aesthetics

### 2. Complete Storyboard
- Scene-by-scene breakdown
- Timing for each scene
- Visual description
- Voiceover script
- On-screen text
- Music direction
- Transitions

### 3. Rich Metadata
- **Target Audience:** Who this demo is for
- **Key Features:** Features to highlight with benefits
- **Duration:** Target video length
- **Platforms:** Optimal distribution channels
- **Pain Points:** Customer problems addressed
- **Call to Action:** Specific CTA
- **Tags:** Searchable metadata
- **Difficulty:** Production complexity
- **Cost:** Estimated production budget

### 4. Examples & Inspiration
- Real-world examples from top companies
- What makes each example great
- Variation suggestions

### 5. Technical Specs
- Aspect ratio (16:9, 9:16, 1:1, 4:5)
- Resolution
- FPS
- Color grading style

## 🎬 Video Types & Styles

### By Platform

| Platform | Aspect Ratio | Duration | Style Tips |
|----------|--------------|----------|------------|
| YouTube | 16:9 | 60-120s | Longer form, detailed |
| Instagram Feed | 1:1 or 4:5 | 30-60s | Eye-catching, captions |
| Instagram Stories | 9:16 | 15-30s | Vertical, text-heavy |
| TikTok | 9:16 | 15-60s | Fast, trendy, authentic |
| LinkedIn | 16:9 or 1:1 | 45-90s | Professional, B2B focus |
| Twitter | 16:9 or 1:1 | 30-45s | Quick, punchy, shareable |
| Website Hero | 16:9 | 30-60s | Auto-play friendly, muted |
| Sales Deck | 16:9 | 60-120s | Detailed, paused frequently |

## 🎯 Best Practices

### 1. Choosing the Right Framework

**Use PRS when:**
- Clear, painful problem exists
- Emotional connection to frustration is important
- Dramatic transformation is key selling point
- B2B audience needs to see business impact

**Use FBTD when:**
- Multiple features to showcase systematically
- Benefits are clear and quantifiable
- Sales-oriented, conversion-focused goal
- Technical audience wants feature details

**Use Save the Cat when:**
- Telling a customer transformation story
- Emotional journey is important
- Longer format allows for depth
- Brand storytelling is priority

### 2. Customization Tips

1. **Replace placeholder names** with your product/brand
2. **Update metrics** to match your actual results
3. **Adjust timing** based on platform and audience
4. **Modify visuals** to match your brand guidelines
5. **Localize** language and cultural references
6. **Test variations** with different hooks and CTAs

### 3. Common Mistakes to Avoid

❌ **Don't:**
- Cram too many features into short videos
- Skip the emotional connection
- Forget clear call-to-action
- Ignore platform-specific requirements
- Use generic stock footage that doesn't match your product
- Make unrealistic claims

✅ **Do:**
- Focus on 3-5 key benefits maximum
- Show real product UI and interactions
- Include specific, believable metrics
- Test hooks and iterate based on performance
- Match tone to audience and platform
- Always include captions for sound-off viewing

## 📊 Prompt Selection Guide

### By Industry

**B2B SaaS:**
- [`crm-sales-acceleration.json`](./prompts/saas/crm-sales-acceleration.json) - Sales tools
- [`project-management-collaboration.json`](./prompts/saas/project-management-collaboration.json) - Team tools
- [`analytics-insights-platform.json`](./prompts/saas/analytics-insights-platform.json) - Data tools

**E-commerce & Retail:**
- [`headless-commerce-platform.json`](./prompts/ecommerce/headless-commerce-platform.json) - Platform demos

**Mobile Apps:**
- [`fitness-tracking-app.json`](./prompts/mobile-apps/fitness-tracking-app.json) - Consumer apps

**Developer Tools:**
- [`api-platform-testing.json`](./prompts/developer-tools/api-platform-testing.json) - Technical products

**AI/ML:**
- [`ml-model-deployment-platform.json`](./prompts/ai-ml/ml-model-deployment-platform.json) - MLOps tools

**Design:**
- [`collaborative-design-platform.json`](./prompts/design-tools/collaborative-design-platform.json) - Creative tools

### By Video Length

**15-30 seconds (Social Media Ads):**
- Use condensed versions
- Focus on single problem → solution
- Strong hook in first 3 seconds
- Clear CTA

**45-60 seconds (Standard Demo):**
- Most prompts optimized for this length
- Balance problem, features, benefits
- 3-5 key features maximum
- Professional and shareable

**90-120 seconds (Detailed Showcase):**
- Full Save the Cat structure
- Multiple use cases
- Customer testimonial integration
- Comprehensive feature tour

## 📁 Project Structure

```
AI-Video-SaaS/
├── README.md                          # This file
├── package.json                       # Project configuration
├── prompts/
│   ├── schema.json                    # JSON schema for all prompts
│   ├── saas/
│   │   ├── crm-sales-acceleration.json
│   │   ├── project-management-collaboration.json
│   │   └── analytics-insights-platform.json
│   ├── mobile-apps/
│   │   └── fitness-tracking-app.json
│   ├── developer-tools/
│   │   └── api-platform-testing.json
│   ├── ecommerce/
│   │   └── headless-commerce-platform.json
│   ├── ai-ml/
│   │   └── ml-model-deployment-platform.json
│   └── design-tools/
│       └── collaborative-design-platform.json
├── frameworks/
│   ├── problem-reaction-solution.md   # PRS framework guide
│   ├── feature-benefit-tiedown.md     # FBTD framework guide
│   └── save-the-cat.md                # Save the Cat guide
├── docs/
│   └── usage-guide.md                 # Detailed usage documentation
└── utils/
    └── prompt-validator.js            # Validate prompts against schema
```

## 🌟 Inspiration & Credits

This library is inspired by the world's best product demos from:
- **SaaS:** Slack, Notion, Figma, Asana, HubSpot, Salesforce
- **Mobile:** Calm, Headspace, Peloton, Duolingo
- **Developer:** Vercel, Supabase, Postman, Railway
- **Design:** Figma, Framer, Canva, Adobe
- **AI/ML:** OpenAI, Anthropic, Hugging Face, Weights & Biases

Storytelling frameworks from:
- Blake Snyder's "Save the Cat"
- Classic sales methodologies (FBTD)
- Problem-Agitate-Solve variations (PRS)

## 📄 License

MIT License - Use these prompts freely for commercial and personal projects.

## 🚀 What's Next?

Planned additions:
- More vertical-specific prompts (Healthcare, FinTech, EdTech)
- Interactive prompt builder web app
- A/B testing frameworks
- Platform-specific optimization guides
- Multi-language variants

---

**Built for the product demo community**

Questions? Suggestions? Contributions welcome!
