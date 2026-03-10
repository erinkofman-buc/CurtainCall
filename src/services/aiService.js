const env = require('../config/env');

const MOCK_SONGS = {
  ballet: [
    { title: 'Swan Lake - Tchaikovsky', reason: 'Classic ballet staple that showcases graceful movement' },
    { title: 'Clair de Lune - Debussy', reason: 'Ethereal and flowing, perfect for lyrical ballet' },
    { title: 'Romeo and Juliet - Prokofiev', reason: 'Dramatic and passionate for expressive choreography' },
  ],
  jazz: [
    { title: 'All That Jazz - Chicago', reason: 'The quintessential jazz dance number' },
    { title: 'Feeling Good - Nina Simone', reason: 'Bold and sassy, great for sharp jazz movements' },
    { title: 'Sing Sing Sing - Benny Goodman', reason: 'High-energy swing perfect for upbeat jazz routines' },
  ],
  'figure-skating': [
    { title: 'Nessun Dorma - Puccini', reason: 'Powerful and sweeping, ideal for dramatic skating programs' },
    { title: 'Hallelujah - k.d. lang', reason: 'Emotional and building, great for expressive programs' },
    { title: 'Scheherazade - Rimsky-Korsakov', reason: 'Rich orchestration that suits complex choreography' },
  ],
  contemporary: [
    { title: 'Breathe Me - Sia', reason: 'Raw and emotional, perfect for contemporary expression' },
    { title: 'Experience - Ludovico Einaudi', reason: 'Building intensity suits evolving choreography' },
    { title: 'Skinny Love - Bon Iver', reason: 'Haunting and intimate for introspective pieces' },
  ],
  default: [
    { title: 'River Flows in You - Yiruma', reason: 'Versatile and beautiful for any performance style' },
    { title: 'Time - Hans Zimmer', reason: 'Builds from delicate to powerful, great for any discipline' },
    { title: 'Adagio for Strings - Barber', reason: 'Timeless and emotional for showcasing artistry' },
  ],
};

const MOCK_DESCRIPTIONS = {
  ballet: 'Beautiful ballet costume perfect for classical and neoclassical repertoire. Features high-quality construction with attention to detail in the bodice and tutu.',
  jazz: 'Eye-catching jazz costume designed for movement and stage presence. Stretchy fabric allows full range of motion for kicks, turns, and jumps.',
  'figure-skating': 'Competition-ready skating dress with rhinestone embellishments that catch the light beautifully on ice. Fully lined with built-in brief.',
  default: 'Performance costume in excellent condition, ready for the stage. Well-constructed with quality materials and thoughtful design details.',
};

async function getSongSuggestions(category, title, description) {
  if (env.mockAI) {
    console.log(`[MOCK AI] Song suggestions for category: ${category}`);
    return MOCK_SONGS[category] || MOCK_SONGS.default;
  }

  // Real mode: use Claude API
  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: env.claudeApiKey });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    messages: [{
      role: 'user',
      content: `Suggest 3 performance songs/music for a ${category} costume titled "${title}". ${description ? `Description: ${description}` : ''} Return JSON array with objects having "title" and "reason" fields.`,
    }],
  });
  return JSON.parse(message.content[0].text);
}

async function generateDescription(category, details) {
  if (env.mockAI) {
    console.log(`[MOCK AI] Description for category: ${category}`);
    return MOCK_DESCRIPTIONS[category] || MOCK_DESCRIPTIONS.default;
  }

  const Anthropic = require('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey: env.claudeApiKey });
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 300,
    messages: [{
      role: 'user',
      content: `Write a short, appealing listing description for a ${category} costume. Details: ${JSON.stringify(details)}. Keep it under 150 words, warm and helpful tone.`,
    }],
  });
  return message.content[0].text;
}

module.exports = { getSongSuggestions, generateDescription };
