import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { TranscriptService } from './transcript-analysis.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ingestion/transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @UseGuards(JwtAuthGuard)
  @Post('analyze')
  async analyze(@Body() body: { transcript: string }, @Req() req: any) {
    return this.transcriptService.analyzeTranscript(body.transcript, req.user.id);
  }
}
