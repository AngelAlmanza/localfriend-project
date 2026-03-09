import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { UserPreferencesService } from "@/src/locals-profile/services/UserPreferencesService"
import { UserPreferencesForm } from "@/src/shared/components/UserPreferencesForm"
import { createClient } from "@/src/shared/lib/supabase/server"
import { MapPin } from "lucide-react"
import { getTranslations } from "next-intl/server"

const getPageData = async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { user: null, preferences: null }

  const { left, right } = await UserPreferencesService.getUserPreferences(user.id, supabase)

  return {
    user,
    preferences: left ? null : right,
  }
}

async function LocalsProfilePage() {
  const { user, preferences } = await getPageData()
  const t = await getTranslations("Shared.profile")
  const tPrefs = await getTranslations("Shared.profile.userPreferences")

  const userInitial = user?.email?.[0]?.toUpperCase() ?? "?"
  const userEmail = user?.email ?? ""

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* User identity header */}
      <div className="flex items-center gap-4 pb-2">
        <div
          className="size-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0"
          aria-hidden="true"
        >
          <span className="text-xl font-semibold text-primary">
            {userInitial}
          </span>
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-foreground truncate">
            {t("title")}
          </h1>
          <p className="text-sm text-muted-foreground truncate">{userEmail}</p>
        </div>
        {
          (preferences?.latitude && preferences?.longitude) && (
            <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <MapPin className="size-3.5 text-primary" aria-hidden="true" />
              <span>{tPrefs("coordinates")}</span>
            </div>
          )
        }
      </div>

      {/* Preferences form */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base font-medium text-foreground">
            {tPrefs("title")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <UserPreferencesForm
            initialValues={{
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              language: preferences?.language as any ?? "es",
              latitude: preferences?.latitude ?? 0,
              longitude: preferences?.longitude ?? 0,
              searchRadius: preferences?.searchRadius ?? 10,
              timezone: preferences?.timezone ?? "America/Mazatlan",
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              preferredCurrency: preferences?.preferredCurrency as any ?? "MXN",
            }}
            id={preferences?.id ?? ""}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default LocalsProfilePage
