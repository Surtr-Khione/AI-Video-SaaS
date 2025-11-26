import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function analyzeQuality(
  filePath: string,
  transcription: string,
  scenes: any[]
): Promise<number> {
  try {
    logger.info(`Analyzing quality for video: ${filePath}`);

    const prompt = `Analyze this product demo video and rate its quality from 0-100.

Transcription:
${transcription}

Number of scenes: ${scenes.length}

Consider:
- Clarity and conciseness of explanation
- Presence of filler words or pauses
- Structure and flow
- Professionalism
- Completeness of demo

Return a JSON object with: score (0-100), strengths (array), weaknesses (array).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert video quality analyst for product demos.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const score = result.score || 50;

    logger.info(`Quality score: ${score}`);
    return score;
  } catch (error) {
    logger.error('Quality analysis failed:', error);
    return 50; // Default score if analysis fails
  }
}
