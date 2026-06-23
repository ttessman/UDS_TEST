import { useSyncExternalStore } from "react";
import {
  getUserPreferencesSnapshot,
  subscribeUserPreferences,
  updateUserPreferences
} from "../store/userPreferences.store.js";

export function useUserPreferences() {
  const preferences = useSyncExternalStore(
    subscribeUserPreferences,
    getUserPreferencesSnapshot,
    getUserPreferencesSnapshot
  );
  const favoriteIds = new Set(preferences.favoriteInstalledPackageIds);

  return {
    favoriteInstalledPackageIds: preferences.favoriteInstalledPackageIds,
    isFavoriteInstalledPackage: (id: string) => favoriteIds.has(id),
    toggleFavoriteInstalledPackage: (id: string) => {
      const existing = new Set(getUserPreferencesSnapshot().favoriteInstalledPackageIds);

      if (existing.has(id)) {
        existing.delete(id);
      } else {
        existing.add(id);
      }

      updateUserPreferences({ favoriteInstalledPackageIds: [...existing] });
    }
  };
}
