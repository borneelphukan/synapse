import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EdgeType, ResponsibilityRole } from '@prisma/client';

@Injectable()
export class DecisionService {
  constructor(private prisma: PrismaService) {}

  async createDecision(data: {
    content: string;
    rationale?: string;
    projectId: string;
    sourceId: string;
    personEmails: string[];
    dependencies?: string[];
  }) {
    // 1. Create Decision
    const decision = await this.prisma.decision.create({
      data: {
        content: data.content,
        rationale: data.rationale,
        projectId: data.projectId,
        sourceId: data.sourceId,
      },
    });

    // 2. Map Persons (Assume they exist or create)
    for (const email of data.personEmails) {
      const person = await this.prisma.person.upsert({
        where: { email },
        update: {},
        create: { email, name: email.split('@')[0] },
      });

      await this.prisma.decisionResponsibility.create({
        data: {
          decisionId: decision.id,
          personId: person.id,
          role: ResponsibilityRole.PROPOSER, // Defaulting for simple extraction
        },
      });
    }

    // 3. Create Edges
    if (data.dependencies) {
      for (const depId of data.dependencies) {
        await this.prisma.decisionEdge.create({
          data: {
            fromDecisionId: depId,
            toDecisionId: decision.id,
            type: EdgeType.DEPENDS_ON,
          },
        });
      }
    }

    return decision;
  }

  async getProjectGraph(projectId: string) {
    const decisions = await this.prisma.decision.findMany({
      where: { projectId },
      include: {
        outgoingEdges: true,
        incomingEdges: true,
        responsibilities: {
          include: { person: true }
        }
      }
    });

    return decisions;
  }
}
