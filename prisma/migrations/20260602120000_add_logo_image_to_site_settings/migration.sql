-- Add logoImage field to SiteSetting
ALTER TABLE "SiteSetting" ADD COLUMN "logoImage" TEXT NOT NULL DEFAULT '';
