#!/usr/bin/env node

/**
 * Prompt Library Browser
 * Lists all available prompts with filtering options
 *
 * Usage:
 *   node utils/list-prompts.js
 *   node utils/list-prompts.js --category=saas
 *   node utils/list-prompts.js --framework=problem-reaction-solution
 *   node utils/list-prompts.js --duration=60s
 */

const fs = require('fs');
const path = require('path');

function getAllPrompts(baseDir = 'prompts') {
  const prompts = [];
  const categories = fs.readdirSync(baseDir).filter(f => {
    const stat = fs.statSync(path.join(baseDir, f));
    return stat.isDirectory();
  });

  categories.forEach(category => {
    const categoryPath = path.join(baseDir, category);
    const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      const filePath = path.join(categoryPath, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        const prompt = JSON.parse(content);
        prompt._category = category;
        prompt._file = file;
        prompts.push(prompt);
      } catch (error) {
        console.error(`Error reading ${filePath}: ${error.message}`);
      }
    });
  });

  return prompts;
}

function filterPrompts(prompts, filters) {
  return prompts.filter(prompt => {
    if (filters.category && prompt._category !== filters.category) {
      return false;
    }
    if (filters.framework && prompt.framework !== filters.framework) {
      return false;
    }
    if (filters.duration && prompt.metadata.duration !== filters.duration) {
      return false;
    }
    if (filters.tag) {
      if (!prompt.metadata.tags || !prompt.metadata.tags.includes(filters.tag)) {
        return false;
      }
    }
    return true;
  });
}

function displayPrompts(prompts) {
  if (prompts.length === 0) {
    console.log('\n❌ No prompts found matching criteria\n');
    return;
  }

  console.log(`\n📚 Found ${prompts.length} prompt(s):\n`);
  console.log('─'.repeat(100));

  prompts.forEach((prompt, index) => {
    console.log(`\n${index + 1}. ${prompt.name}`);
    console.log(`   ID: ${prompt.id}`);
    console.log(`   Category: ${prompt._category}`);
    console.log(`   Framework: ${prompt.framework}`);
    console.log(`   Duration: ${prompt.metadata.duration}`);
    console.log(`   Audiences: ${prompt.metadata.targetAudience.slice(0, 3).join(', ')}${prompt.metadata.targetAudience.length > 3 ? '...' : ''}`);
    console.log(`   File: prompts/${prompt._category}/${prompt._file}`);

    if (prompt.metadata.keyFeatures) {
      console.log(`   Features: ${prompt.metadata.keyFeatures.length}`);
      const highlighted = prompt.metadata.keyFeatures.filter(f => f.highlight);
      if (highlighted.length > 0) {
        console.log(`   Key Highlights: ${highlighted.map(f => f.feature).join(', ')}`);
      }
    }

    console.log('─'.repeat(100));
  });

  console.log('');
}

function displayStats(prompts) {
  console.log('\n📊 Library Statistics:\n');

  // By category
  const byCategory = {};
  prompts.forEach(p => {
    byCategory[p._category] = (byCategory[p._category] || 0) + 1;
  });
  console.log('By Category:');
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });

  // By framework
  const byFramework = {};
  prompts.forEach(p => {
    byFramework[p.framework] = (byFramework[p.framework] || 0) + 1;
  });
  console.log('\nBy Framework:');
  Object.entries(byFramework).forEach(([fw, count]) => {
    console.log(`   ${fw}: ${count}`);
  });

  // By duration
  const byDuration = {};
  prompts.forEach(p => {
    const dur = p.metadata.duration;
    byDuration[dur] = (byDuration[dur] || 0) + 1;
  });
  console.log('\nBy Duration:');
  Object.entries(byDuration).forEach(([dur, count]) => {
    console.log(`   ${dur}: ${count}`);
  });

  console.log('\n');
}

// Main execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const filters = {};

  // Parse arguments
  args.forEach(arg => {
    if (arg === '--stats') {
      filters.showStats = true;
    } else if (arg.startsWith('--')) {
      const [key, value] = arg.substring(2).split('=');
      filters[key] = value;
    }
  });

  try {
    const allPrompts = getAllPrompts();

    if (filters.showStats) {
      displayStats(allPrompts);
    } else {
      const filtered = filterPrompts(allPrompts, filters);
      displayPrompts(filtered);

      if (Object.keys(filters).length === 0) {
        console.log('💡 Tip: Use filters to narrow results:');
        console.log('   --category=saas');
        console.log('   --framework=problem-reaction-solution');
        console.log('   --duration=60s');
        console.log('   --tag=AI');
        console.log('   --stats (show statistics)\n');
      }
    }
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

module.exports = { getAllPrompts, filterPrompts };
