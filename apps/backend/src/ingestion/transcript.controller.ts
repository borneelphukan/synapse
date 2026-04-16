import { Controller, Post, Body } from '@nestjs/common';
import { TranscriptService } from './transcript-analysis.service';

@Controller('ingestion/transcript')
export class TranscriptController {
  constructor(private readonly transcriptService: TranscriptService) {}

  @Post('analyze')
  async analyze(@Body() body: { transcript: string }) {
    return this.transcriptService.analyzeTranscript(body.transcript);
  }
}
