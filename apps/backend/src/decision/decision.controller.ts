import { Controller, Get, Param } from '@nestjs/common';
import { DecisionService } from './decision.service';

@Controller('decisions')
export class DecisionController {
  constructor(private readonly decisionService: DecisionService) {}

  @Get('project/:projectId')
  async getGraph(@Param('projectId') projectId: string) {
    return this.decisionService.getProjectGraph(projectId);
  }
}
