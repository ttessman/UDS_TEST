const storageKey = "uds-poc-user-preferences";

export type UserPreferences = {
  favoriteInstalledPackageIds: string[];
};

const defaultPreferences: UserPreferences = {
  favoriteInstalledPackageIds: []
};

let currentPreferences = readPreferences();
const listeners = new Set<() => void>();

export function getInstalledPackagePreferenceId(namespace: string, name: string) {
  return `${namespace}/${name}`.toLowerCase();
}

export function subscribeUserPreferences(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

export function getUserPreferencesSnapshot() {
  return currentPreferences;
}

export function updateUserPreferences(nextPreferences: UserPreferences) {
  currentPreferences = nextPreferences;
  window.localStorage.setItem(storageKey, JSON.stringify(nextPreferences));
  listeners.forEach((listener) => listener());
}

function readPreferences(): UserPreferences {
  try {
    const stored = window.localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) as Partial<UserPreferences> : null;

    return {
      favoriteInstalledPackageIds: Array.isArray(parsed?.favoriteInstalledPackageIds)
        ? parsed.favoriteInstalledPackageIds.filter((id): id is string => typeof id === "string")
        : defaultPreferences.favoriteInstalledPackageIds
    };
  } catch {
    return defaultPreferences;
  }
}
