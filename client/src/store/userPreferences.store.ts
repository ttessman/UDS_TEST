import { useSyncExternalStore } from "react";

const storageKey = "uds-poc-user-preferences";

type UserPreferences = {
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

export function useUserPreferences() {
  const preferences = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const favoriteIds = new Set(preferences.favoriteInstalledPackageIds);

  return {
    favoriteInstalledPackageIds: preferences.favoriteInstalledPackageIds,
    isFavoriteInstalledPackage: (id: string) => favoriteIds.has(id),
    toggleFavoriteInstalledPackage: (id: string) => {
      const existing = new Set(currentPreferences.favoriteInstalledPackageIds);

      if (existing.has(id)) {
        existing.delete(id);
      } else {
        existing.add(id);
      }

      updatePreferences({ favoriteInstalledPackageIds: [...existing] });
    }
  };
}

function subscribe(listener: () => void) {
  listeners.add(listener);

  return () => listeners.delete(listener);
}

function getSnapshot() {
  return currentPreferences;
}

function updatePreferences(nextPreferences: UserPreferences) {
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
