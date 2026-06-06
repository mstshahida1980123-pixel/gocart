-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ContactMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'site',
    "phone" TEXT NOT NULL DEFAULT '+1 (800) 322-1384',
    "email" TEXT NOT NULL DEFAULT 'support@gocart.com',
    "address" TEXT NOT NULL DEFAULT '425 Market Street, San Francisco, CA',
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
    "copyrightText" TEXT NOT NULL DEFAULT 'Copyright 2025 © gocart All Right Reserved.',
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mrp" REAL NOT NULL,
    "price" REAL NOT NULL,
    "images" TEXT NOT NULL DEFAULT '[]',
    "category" TEXT NOT NULL,
    "categoryId" TEXT,
    "latest" BOOLEAN NOT NULL DEFAULT false,
    "bestSelling" BOOLEAN NOT NULL DEFAULT false,
    "inStock" BOOLEAN NOT NULL DEFAULT true,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("category", "createdAt", "description", "featured", "id", "images", "inStock", "mrp", "name", "price", "updatedAt") SELECT "category", "createdAt", "description", "featured", "id", "images", "inStock", "mrp", "name", "price", "updatedAt" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");
