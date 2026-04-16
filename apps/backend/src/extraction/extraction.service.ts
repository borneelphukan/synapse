import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import OpenAI from 'openai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ExtractionService {
  private readonly logger = new Logger(ExtractionService.name);
  private openai: OpenAI | null = null;

  constructor(private configService: ConfigService) {}

  private getOpenAI(): OpenAI {
    if (!this.openai) {
      const apiKey = this.configService.get<string>('OPENAI_API_KEY');
      if (!apiKey) throw new Error('OPENAI_API_KEY missing');
      this.openai = new OpenAI({ apiKey });
    }
    return this.openai;
  }

  // Token-optimized cleanup
  private cleanTranscript(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Replace all whitespace/newlines with single space
      .trim();
  }

  async analyzeFullTranscript(transcript: string) {
    try {
      const cleaned = this.cleanTranscript(transcript);
      const prompt = `Extract speakers and decisions from transcript. 
Return JSON: {"participants":["Name"],"decisions":[{"content":"Act","rationale":"Why","participants":["Name"]}]}
Concise text only.
Transcript: ${cleaned}`;

      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'system', content: 'You extract JSON from meetings.' }, { role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1500, // Limit output growth
        temperature: 0, // More deterministic = fewer retries
      });

      const text = response.choices[0].message.content;
      return JSON.parse(text || '{"participants":[],"decisions":[]}');
    } catch (error) {
      this.handleError(error);
    }
  }

  async extractDecisions(transcript: string) {
    try {
      const cleaned = this.cleanTranscript(transcript);
      const prompt = `Extract decisions as JSON: {"decisions":[{"content":"","rationale":"","participants":[]}]}
Transcript: ${cleaned}`;

      const openai = this.getOpenAI();
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0,
      });

      return JSON.parse(response.choices[0].message.content || '{"decisions":[]}');
    } catch (error) {
      this.logger.error(`Failed: ${error.message}`);
      return { decisions: [] };
    }
  }

  private handleError(error: any) {
    const status = error?.status || 500;
    this.logger.error(`AI Error: ${error.message}`);
    throw new HttpException(error.message, status);
  }
}
