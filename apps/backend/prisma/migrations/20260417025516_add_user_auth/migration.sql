-- CreateEnum
CREATE TYPE "DecisionStatus" AS ENUM ('PROPOSED', 'FINALIZED', 'REJECTED', 'DEPRECATED');

-- CreateEnum
CREATE TYPE "ResponsibilityRole" AS ENUM ('PROPOSER', 'APPROVER', 'STAKEHOLDER', 'EXECUTOR');

-- CreateEnum
CREATE TYPE "EdgeType" AS ENUM ('DEPENDS_ON', 'RELATES_TO', 'REFINES', 'BLOCKS');

-- CreateEnum
CREATE TYPE "SourceType" AS ENUM ('GOOGLE_MEET');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "company" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Person" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Person_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "rationale" TEXT,
    "status" "DecisionStatus" NOT NULL DEFAULT 'PROPOSED',
    "projectId" TEXT NOT NULL,
    "sourceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionResponsibility" (
    "id" TEXT NOT NULL,
    "decisionId" TEXT NOT NULL,
    "personId" TEXT NOT NULL,
    "role" "ResponsibilityRole" NOT NULL,

    CONSTRAINT "DecisionResponsibility_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionEdge" (
    "id" TEXT NOT NULL,
    "fromDecisionId" TEXT NOT NULL,
    "toDecisionId" TEXT NOT NULL,
    "type" "EdgeType" NOT NULL,

    CONSTRAINT "DecisionEdge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Source" (
    "id" TEXT NOT NULL,
    "type" "SourceType" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT,
    "rawContent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Source_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Person_email_key" ON "Person"("email");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionResponsibility_decisionId_personId_role_key" ON "DecisionResponsibility"("decisionId", "personId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "DecisionEdge_fromDecisionId_toDecisionId_type_key" ON "DecisionEdge"("fromDecisionId", "toDecisionId", "type");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "Source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionResponsibility" ADD CONSTRAINT "DecisionResponsibility_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionResponsibility" ADD CONSTRAINT "DecisionResponsibility_personId_fkey" FOREIGN KEY ("personId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionEdge" ADD CONSTRAINT "DecisionEdge_fromDecisionId_fkey" FOREIGN KEY ("fromDecisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionEdge" ADD CONSTRAINT "DecisionEdge_toDecisionId_fkey" FOREIGN KEY ("toDecisionId") REFERENCES "Decision"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
