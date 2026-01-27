-- CreateEnum
CREATE TYPE "OrganizationContactKind" AS ENUM ('PERSON', 'COMPANY');

-- CreateTable
CREATE TABLE "OrganizationContact" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "kind" "OrganizationContactKind" NOT NULL DEFAULT 'PERSON',
    "name" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationContact_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrganizationContact" ADD CONSTRAINT "OrganizationContact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
