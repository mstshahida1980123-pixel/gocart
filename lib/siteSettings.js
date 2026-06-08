import prisma from './prisma';

export async function fetchSiteSettings() {
  try {
    const settings = await prisma.siteSettings.findFirst();
    return settings;
  } catch (err) {
    return null;
  }
}

export function clearSiteSettingsCache() {}