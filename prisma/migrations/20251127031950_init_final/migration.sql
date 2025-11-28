-- CreateTable
CREATE TABLE "Process" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sector" TEXT NOT NULL,
    "manager" TEXT NOT NULL,
    "responsibleServers" TEXT[],
    "legalBasis" TEXT,
    "systemsUsed" TEXT[],
    "stakeholders" TEXT[],
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Process_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Risk" (
    "id" TEXT NOT NULL,
    "processId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identificationDate" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "association" TEXT NOT NULL,
    "causes" TEXT NOT NULL,
    "consequences" TEXT NOT NULL,
    "dimensions" TEXT[],
    "probability" INTEGER NOT NULL,
    "probabilityJustification" TEXT,
    "impact" INTEGER NOT NULL,
    "impactJustification" TEXT,
    "inherentRisk" DOUBLE PRECISION NOT NULL,
    "controlsExist" BOOLEAN NOT NULL DEFAULT false,
    "isControlEffective" BOOLEAN NOT NULL DEFAULT false,
    "isControlProportional" BOOLEAN NOT NULL DEFAULT false,
    "isControlReasonable" BOOLEAN NOT NULL DEFAULT false,
    "isControlAdequate" BOOLEAN NOT NULL DEFAULT false,
    "fac" DOUBLE PRECISION NOT NULL,
    "residualRisk" DOUBLE PRECISION NOT NULL,
    "suggestedResponse" TEXT NOT NULL,
    "maxImplementationDate" TEXT,
    "isLgpdRelated" BOOLEAN NOT NULL DEFAULT false,
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Risk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Control" (
    "id" TEXT NOT NULL,
    "riskId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "implemented" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL,
    "newOrModified" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "nature" TEXT NOT NULL,
    "relationToRisk" TEXT NOT NULL,
    "responsible" TEXT NOT NULL,
    "implementationMethod" TEXT NOT NULL,
    "macroSteps" TEXT NOT NULL,
    "plannedStartDate" TEXT,
    "plannedEndDate" TEXT,
    "actualEndDate" TEXT,
    "involvedSectors" TEXT[],
    "adequacyAnalysis" TEXT,
    "history" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Control_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Risk" ADD CONSTRAINT "Risk_processId_fkey" FOREIGN KEY ("processId") REFERENCES "Process"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Control" ADD CONSTRAINT "Control_riskId_fkey" FOREIGN KEY ("riskId") REFERENCES "Risk"("id") ON DELETE CASCADE ON UPDATE CASCADE;
