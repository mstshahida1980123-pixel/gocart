let settingsPromise = null;

export function fetchSiteSettings() {
  if (!settingsPromise) {
    settingsPromise = fetch('/api/site-settings')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load site settings');
        return res.json();
      })
      .catch(err => {
        settingsPromise = null;
        throw err;
      });
  }
  return settingsPromise;
}

export function clearSiteSettingsCache() {
  settingsPromise = null;
}
