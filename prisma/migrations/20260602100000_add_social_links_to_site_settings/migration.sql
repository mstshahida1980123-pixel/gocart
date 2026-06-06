-- Add socialLinks field to SiteSetting
ALTER TABLE "SiteSetting" ADD COLUMN "socialLinks" TEXT NOT NULL DEFAULT '[]';
