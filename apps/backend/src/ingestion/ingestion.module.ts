import { Module } from '@nestjs/common';
import { TranscriptService } from './transcript-analysis.service';
import { TranscriptController } from './transcript.controller';
import { ExtractionModule } from '../extraction/extraction.module';

@Module({
  imports: [ExtractionModule],
  controllers: [TranscriptController],
  providers: [TranscriptService],
  exports: [TranscriptService],
})
export class IngestionModule {}
