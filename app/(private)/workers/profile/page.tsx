import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/src/shared/lib/supabase/server"
import { UserPreferencesForm } from "@/src/workers-profile/components/UserPreferencesForm"
import { UserPreferencesService } from "@/src/workers-profile/services/UserPreferencesService"
import { getTranslations } from "next-intl/server"

const getUserPreferences = async () => {
  const supabase = await createClient()
  const { data: user } = await supabase.auth.getUser()

  // If user is not authenticated, return null
  if (!user) {
    return null
  }

  // If user is authenticated, get user preferences
  const { left, right } = await UserPreferencesService.getUserPreferences(user.user!.id, supabase)

  return left ? null : right
}

async function ProfilePage() {
  const userPreferences = await getUserPreferences()
  const t = await getTranslations("Workers.profile.userPreferences")

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <UserPreferencesForm
          initialValues={{
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            language: userPreferences?.language as any ?? "es",
            latitude: userPreferences?.latitude ?? 0,
            longitude: userPreferences?.longitude ?? 0,
            searchRadius: userPreferences?.searchRadius ?? 10,
            timezone: userPreferences?.timezone ?? "America/Santiago",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            preferredCurrency: userPreferences?.preferredCurrency as any ?? "MXN",
          }}
          id={userPreferences?.id ?? ""}
        />
      </CardContent>
    </Card>
  )
}
export default ProfilePage