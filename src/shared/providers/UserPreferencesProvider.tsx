"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient } from "../lib/supabase/client";
import { UserPreferencesResponse } from "../interfaces/UserPreferences";
import { UserPreferencesService } from "../services/UserPreferencesService";
import { useUserContext } from "./UserProvider";

interface UserPreferencesContextType {
  preferences: UserPreferencesResponse | null;
  loading: boolean;
  refreshPreferences: () => Promise<void>;
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(null);

export const useUserPreferences = () => {
  const context = useContext(UserPreferencesContext);
  if (!context) {
    throw new Error("useUserPreferences must be used within a UserPreferencesProvider");
  }
  return context;
};

export const UserPreferencesProvider = ({
  initialPreferences,
  children,
}: {
  initialPreferences: UserPreferencesResponse | null;
  children: Readonly<React.ReactNode>;
}) => {
  const supabase = useMemo(() => createClient(), []);
  const { user } = useUserContext();
  const [preferences, setPreferences] = useState<UserPreferencesResponse | null>(
    initialPreferences,
  );
  const [loading, setLoading] = useState(!initialPreferences);

  const refreshPreferences = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { right } = await UserPreferencesService.getUserPreferences(user.id, supabase);
    if (right) {
      setPreferences(right);
      // Update cookie via server action
      const { setUserPreferencesCookie } = await import(
        "../actions/user-preferences.action"
      );
      await setUserPreferencesCookie(right);
    }
    setLoading(false);
  }, [user, supabase]);

  useEffect(() => {
    if (!initialPreferences && user) {
      refreshPreferences();
    }
  }, [user, initialPreferences, refreshPreferences]);

  return (
    <UserPreferencesContext.Provider value={{ preferences, loading, refreshPreferences }}>
      {children}
    </UserPreferencesContext.Provider>
  );
};
