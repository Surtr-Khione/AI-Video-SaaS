import OpenAI from 'openai';
import { logger } from '../utils/logger';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface Scene {
  id: string;
  startTime: number;
  endTime: number;
  type: 'INTRO' | 'FEATURE_DEMO' | 'TRANSITION' | 'CONCLUSION' | 'PAUSE' | 'ERROR';
  description: string;
  confidence: number;
}

export async function detectScenes(
  filePath: string,
  transcription: string
): Promise<Scene[]> {
  try {
    logger.info(`Detecting scenes for video: ${filePath}`);

    const prompt = `Analyze this video transcription and identify distinct scenes for a product demo video.

Transcription:
${transcription}

Identify and categorize scenes into:
- INTRO: Introduction or opening remarks
- FEATURE_DEMO: Demonstration of a specific feature
- TRANSITION: Transition between topics
- CONCLUSION: Closing remarks or summary
- PAUSE: Long pauses or dead air
- ERROR: Mistakes, fumbles, or filler words

Return a JSON array of scenes with: id, startTime (seconds), endTime (seconds), type, description, and confidence (0-1).`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an expert video editor analyzing screen share sales demos. Identify key scenes and their timestamps.',
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const scenes: Scene[] = result.scenes || [];

    logger.info(`Detected ${scenes.length} scenes`);
    return scenes;
  } catch (error) {
    logger.error('Scene detection failed:', error);
    // Return empty array if detection fails
    return [];
  }
}
