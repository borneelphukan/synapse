import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ExtractionService } from '../extraction/extraction.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TranscriptService {
  private readonly logger = new Logger(TranscriptService.name);

  constructor(
    private extractionService: ExtractionService,
    private prisma: PrismaService,
  ) {}

  async analyzeTranscript(transcript: string, userId: string) {
    if (!transcript || transcript.trim().length === 0) {
      throw new BadRequestException('Transcript is empty');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Restrict usage based on plan
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentCount = user.analysisCount;
    if (!user.lastAnalysisDate || user.lastAnalysisDate < today) {
      currentCount = 0; // Reset count for a new day
    }

    let maxAnalysis = 3;
    let maxTokens = 3000;

    if (user.plan === 'BASIC') {
      maxAnalysis = 10;
      maxTokens = 15000;
    } else if (user.plan === 'PRO') {
      maxAnalysis = 999999;
      maxTokens = 100000;
    }

    if (currentCount >= maxAnalysis) {
      throw new BadRequestException(`Daily limit reached. Your ${user.plan} plan allows ${maxAnalysis} analysis per day.`);
    }

    const wordCount = transcript.trim().split(/\s+/).length;
    if (wordCount > maxTokens) {
      throw new BadRequestException(`Transcript is too large. Your ${user.plan} plan allows up to ${maxTokens} words (size: ${wordCount} words). Please upgrade or upload a smaller file.`);
    }

    this.logger.log(
      `Analyzing transcript (${wordCount} words, ~${transcript.split('\n').length} lines) for user ${user.email} [Plan: ${user.plan}]`,
    );

    // 1. Parse participants from transcript structure (Speaker: text format)
    const parsedParticipants = this.parseParticipantsFromText(transcript);
    this.logger.log(`Parsed ${parsedParticipants.length} participants from text structure`);

    // 2. Parse transcript into structured lines
    const transcriptLines = this.parseTranscriptLines(transcript);

    // 3. Use Gemini to extract decisions and identify participants
    const extractionResult = await this.extractionService.analyzeFullTranscript(transcript);

    // 4. Merge parsed participants with AI-identified participants
    const aiParticipants: string[] = extractionResult.participants || [];
    const allParticipants = Array.from(
      new Set([...parsedParticipants, ...aiParticipants]),
    );

    this.logger.log(
      `Total participants: ${allParticipants.length}, Decisions: ${extractionResult.decisions?.length || 0}`,
    );

    // 5. Update user usage counter
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        analysisCount: currentCount + 1,
        lastAnalysisDate: new Date(),
      },
    });

    return {
      participants: allParticipants,
      decisions: extractionResult.decisions || [],
      transcript: transcriptLines,
    };
  }

  private parseParticipantsFromText(transcript: string): string[] {
    const participants = new Set<string>();
    const lines = transcript.split('\n');

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Match patterns like "Name:", "Name (HH:MM):", "[HH:MM] Name:", "Name - HH:MM:"
      const patterns = [
        /^([A-Za-z][A-Za-z\s.'-]{1,40}):\s/,                          // "Name: text"
        /^\[[\d:]+\]\s*([A-Za-z][A-Za-z\s.'-]{1,40}):\s/,              // "[10:30] Name: text"
        /^(\d{1,2}:\d{2}(?::\d{2})?)\s+([A-Za-z][A-Za-z\s.'-]{1,40}):\s/, // "10:30 Name: text"
        /^([A-Za-z][A-Za-z\s.'-]{1,40})\s+\([\d:]+\):\s/,             // "Name (10:30): text"
        /^([A-Za-z][A-Za-z\s.'-]{1,40})\s+-\s+/,                      // "Name - text"
      ];

      for (const pattern of patterns) {
        const match = trimmed.match(pattern);
        if (match) {
          // For the timestamp+name pattern, the name is in group 2
          const name =
            pattern === patterns[2] ? match[2]?.trim() : match[1]?.trim();
          if (name && name.length > 1 && name.length < 40) {
            participants.add(name);
          }
          break;
        }
      }
    }

    return Array.from(participants);
  }

  private parseTranscriptLines(transcript: string): string[] {
    return transcript
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }
}
