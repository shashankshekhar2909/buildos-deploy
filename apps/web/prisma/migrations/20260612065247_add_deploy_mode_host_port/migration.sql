-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN     "deployMode" TEXT NOT NULL DEFAULT 'CONTAINER',
ADD COLUMN     "hostPort" INTEGER;
