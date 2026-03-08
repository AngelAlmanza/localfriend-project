import { getUserPreferencesCookie } from "@/src/shared/actions/user-preferences.action";
import { UserPreferencesProvider } from "@/src/shared/providers/UserPreferencesProvider";

export default async function PrivateLayout({
  children,
}: {
  children: Readonly<React.ReactNode>;
}) {
  const initialPreferences = await getUserPreferencesCookie();

  return (
    <UserPreferencesProvider initialPreferences={initialPreferences}>
      {children}
    </UserPreferencesProvider>
  );
}
