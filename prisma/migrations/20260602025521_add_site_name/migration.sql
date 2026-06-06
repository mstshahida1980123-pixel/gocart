-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_SiteSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site',
    "siteName" TEXT NOT NULL DEFAULT 'gocart',
    "phone" TEXT NOT NULL DEFAULT '+1 (800) 322-1384',
    "email" TEXT NOT NULL DEFAULT 'support@gocart.com',
    "address" TEXT NOT NULL DEFAULT '425 Market Street, San Francisco, CA',
    "logoImage" TEXT NOT NULL DEFAULT '',
    "facebookPixelId" TEXT NOT NULL DEFAULT '',
    "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
    "googleTagManagerId" TEXT NOT NULL DEFAULT '',
    "seoTitle" TEXT NOT NULL DEFAULT 'GoCart. - Shop smarter',
    "metaDescription" TEXT NOT NULL DEFAULT 'GoCart is the online shop for curated gadgets, essentials, and fast support.',
    "metaKeywords" TEXT NOT NULL DEFAULT 'electronics,gadgets,shopping,online store,technology',
    "announcement" TEXT NOT NULL DEFAULT '',
    "headerNav" TEXT NOT NULL DEFAULT '[]',
    "footerProducts" TEXT NOT NULL DEFAULT '[]',
    "footerWebsite" TEXT NOT NULL DEFAULT '[]',
    "socialLinks" TEXT NOT NULL DEFAULT '[]',
    "copyrightText" TEXT NOT NULL DEFAULT 'Copyright 2025 © gocart All Right Reserved.',
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_SiteSetting" ("address", "announcement", "copyrightText", "email", "facebookPixelId", "footerProducts", "footerWebsite", "googleAnalyticsId", "googleTagManagerId", "headerNav", "id", "logoImage", "metaDescription", "metaKeywords", "phone", "seoTitle", "socialLinks", "updatedAt") SELECT "address", "announcement", "copyrightText", "email", "facebookPixelId", "footerProducts", "footerWebsite", "googleAnalyticsId", "googleTagManagerId", "headerNav", "id", "logoImage", "metaDescription", "metaKeywords", "phone", "seoTitle", "socialLinks", "updatedAt" FROM "SiteSetting";
DROP TABLE "SiteSetting";
ALTER TABLE "new_SiteSetting" RENAME TO "SiteSetting";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
