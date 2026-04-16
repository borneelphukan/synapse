import { Module } from '@nestjs/common';
import { DecisionService } from './decision.service';
import { DecisionController } from './decision.controller';

@Module({
  controllers: [DecisionController],
  providers: [DecisionService],
  exports: [DecisionService],
})
export class DecisionModule {}
