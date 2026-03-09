"use client";

import { useUserPreferences } from "@/src/shared/providers/UserPreferencesProvider";
import { UserPreferencesService } from "@/src/shared/services/UserPreferencesService";
import { createClient } from "@/src/shared/lib/supabase/client";
import { useUserContext } from "@/src/shared/providers/UserProvider";
import { useCallback, useEffect, useMemo, useState } from "react";

type LocationStatus =
  | "loading"
  | "available"
  | "requesting"
  | "denied"
  | "unavailable";

export const useGeolocation = () => {
  const { user } = useUserContext();
  const { preferences, refreshPreferences } = useUserPreferences();
  const supabase = useMemo(() => createClient(), []);
  const [status, setStatus] = useState<LocationStatus>("loading");

  useEffect(() => {
    if (!preferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStatus("loading");
      return;
    }

    if (preferences.latitude && preferences.longitude) {
      setStatus("available");
    } else {
      setStatus("unavailable");
    }
  }, [preferences]);

  const requestGeolocation = useCallback(async () => {
    if (!user || !preferences) return;

    if (!navigator.geolocation) {
      setStatus("denied");
      return;
    }

    setStatus("requesting");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        await UserPreferencesService.updateUserPreferences(
          {
            id: preferences.id,
            userId: user.id,
            language: preferences.language ?? "",
            latitude,
            longitude,
            searchRadiusKm: preferences.searchRadius ?? 50,
            timezone: preferences.timezone ?? "",
            preferredCurrency: preferences.preferredCurrency ?? "",
            updatedAt: new Date().toISOString(),
          },
          supabase,
        );

        await refreshPreferences();
        setStatus("available");
      },
      () => {
        setStatus("denied");
      },
      { enableHighAccuracy: false, timeout: 10000 },
    );
  }, [user, preferences, supabase, refreshPreferences]);

  return {
    hasLocation: status === "available",
    locationDenied: status === "denied",
    isRequesting: status === "requesting",
    isLoading: status === "loading",
    showBanner: status === "unavailable" || status === "denied",
    requestGeolocation,
  };
};
