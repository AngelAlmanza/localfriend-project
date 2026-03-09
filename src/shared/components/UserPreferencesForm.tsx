"use client"

import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { LATAM_TIMEZONES } from "@/src/shared/constants/LatamTimezones"
import { createClient } from "@/src/shared/lib/supabase/client"
import { useUserContext } from "@/src/shared/providers/UserProvider"
import { buildUserPreferencesSchema, UserPreferencesSchema } from "@/src/shared/schemas/user-preferences.schema"
import { UserPreferencesService } from "@/src/shared/services/UserPreferencesService"
import { zodResolver } from "@hookform/resolvers/zod"
import { MapPin, Navigation } from "lucide-react"
import { useTranslations } from "next-intl"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import { setLocaleAction } from "../actions/set-locale.action"

const FORM_ID = "user-preferences-form"

interface UserPreferencesFormProps {
  initialValues: UserPreferencesSchema
  id: string
}

export const UserPreferencesForm = ({ initialValues, id }: UserPreferencesFormProps) => {
  const { user } = useUserContext()
  const t = useTranslations("Shared.profile.userPreferences")
  const router = useRouter()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [locationDenied, setLocationDenied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<UserPreferencesSchema>({
    resolver: zodResolver(buildUserPreferencesSchema({
      languageErrorMessage: t("languageErrorMessage"),
      timezoneErrorMessage: t("timezoneErrorMessage"),
      preferredCurrencyErrorMessage: t("preferredCurrencyErrorMessage"),
    })),
    defaultValues: initialValues,
  })

  const CURRENCY_OPTIONS = useMemo(() => [
    { value: "MXN", flag: "🇲🇽", name: t("currency.mexicanPeso") },
    { value: "COP", flag: "🇨🇴", name: t("currency.colombianPeso") },
    { value: "PEN", flag: "🇵🇪", name: t("currency.peruvianSol") },
    { value: "ARS", flag: "🇦🇷", name: t("currency.argentinePeso") },
    { value: "CLP", flag: "🇨🇱", name: t("currency.chileanPeso") },
    { value: "UYU", flag: "🇺🇾", name: t("currency.uruguayanPeso") },
    { value: "BRL", flag: "🇧🇷", name: t("currency.brazilianReal") },
    { value: "VEF", flag: "🇻🇪", name: t("currency.venezuelanBolivar") },
  ], [t]);

  const handleGetLocation = () => {
    setLocationDenied(false)
    setIsGettingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        form.setValue("latitude", position.coords.latitude, { shouldValidate: true })
        form.setValue("longitude", position.coords.longitude, { shouldValidate: true })
        setIsGettingLocation(false)
      },
      () => {
        setLocationDenied(true)
        setIsGettingLocation(false)
      }
    )
  }

  const onSubmit = async (values: UserPreferencesSchema) => {
    setIsLoading(true)
    const supabase = createClient()
    const { left } = await UserPreferencesService.updateUserPreferences({
      ...values,
      searchRadiusKm: values.searchRadius,
      preferredCurrency: values.preferredCurrency,
      userId: user!.id,
      id,
      updatedAt: new Date().toUTCString(),
    }, supabase)

    if (left) {
      toast.error(left.message)
    } else {
      toast.success(t("success"))
      if (values.language !== initialValues.language) {
        await setLocaleAction(values.language)
        router.refresh()
      }
    }
    setIsLoading(false)
  }

  return (
    <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>

        {/* Language */}
        <Controller
          control={form.control}
          name="language"
          render={({ field, fieldState }) => (
            <FieldSet data-invalid={fieldState.invalid}>
              <FieldLegend variant="label">{t("language")}</FieldLegend>
              <RadioGroup
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
                aria-invalid={fieldState.invalid}
                className="flex flex-row gap-6"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="en"
                    id={`${FORM_ID}-lang-en`}
                    aria-invalid={fieldState.invalid}
                  />
                  <label
                    htmlFor={`${FORM_ID}-lang-en`}
                    className="text-sm leading-none cursor-pointer"
                  >
                    {t("languageEn")}
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem
                    value="es"
                    id={`${FORM_ID}-lang-es`}
                    aria-invalid={fieldState.invalid}
                  />
                  <label
                    htmlFor={`${FORM_ID}-lang-es`}
                    className="text-sm leading-none cursor-pointer"
                  >
                    {t("languageEs")}
                  </label>
                </div>
              </RadioGroup>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </FieldSet>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Timezone */}
          <Controller
            control={form.control}
            name="timezone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${FORM_ID}-timezone`}>{t("timezone")}</FieldLabel>
                <div className="flex gap-2">
                  <Select
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={`${FORM_ID}-timezone`}
                      className="flex-1"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder={t("timezonePlaceholder")} />
                    </SelectTrigger>
                    <SelectContent>
                      {LATAM_TIMEZONES.map((tz) => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone
                      if (LATAM_TIMEZONES.includes(browserTz)) {
                        field.onChange(browserTz)
                      }
                    }}
                    aria-label={t("useCurrentTimezone")}
                    title={t("useCurrentTimezone")}
                  >
                    <Navigation className="size-4" aria-hidden="true" />
                  </Button>
                </div>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          {/* Preferred Currency */}
          <Controller
            control={form.control}
            name="preferredCurrency"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={`${FORM_ID}-currency`}>{t("preferredCurrency")}</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id={`${FORM_ID}-currency`}
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder={t("currencyPlaceholder")} />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        <span aria-hidden="true">{currency.flag}</span>
                        <span>{currency.value} – {currency.name}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
        </div>

        {/* Coordinates */}
        <FieldSet>
          <FieldLegend variant="label">{t("coordinates")}</FieldLegend>
          <FieldDescription>{t("coordinatesDescription")}</FieldDescription>
          <div className="flex gap-3">
            <Controller
              control={form.control}
              name="latitude"
              render={({ field, fieldState }) => (
                <Field className="flex-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-latitude`}>{t("latitude")}</FieldLabel>
                  <Input
                    id={`${FORM_ID}-latitude`}
                    value={field.value !== undefined ? String(field.value) : ""}
                    readOnly
                    disabled
                    aria-disabled="true"
                    aria-readonly="true"
                    placeholder="—"
                  />
                </Field>
              )}
            />
            <Controller
              control={form.control}
              name="longitude"
              render={({ field, fieldState }) => (
                <Field className="flex-1" data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-longitude`}>{t("longitude")}</FieldLabel>
                  <Input
                    id={`${FORM_ID}-longitude`}
                    value={field.value !== undefined ? String(field.value) : ""}
                    readOnly
                    disabled
                    aria-disabled="true"
                    aria-readonly="true"
                    placeholder="—"
                  />
                </Field>
              )}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit"
              onClick={handleGetLocation}
              disabled={isGettingLocation}
              aria-busy={isGettingLocation}
            >
              {isGettingLocation
                ? <LoadingIcon />
                : <MapPin className="size-4" aria-hidden="true" />
              }
              {isGettingLocation ? t("gettingLocation") : t("getCoordinates")}
            </Button>
            {locationDenied && (
              <p role="alert" aria-live="assertive" className="text-destructive text-sm">
                {t("locationDenied")}
              </p>
            )}
          </div>
        </FieldSet>

        {/* Search Radius */}
        <Controller
          control={form.control}
          name="searchRadius"
          render={({ field, fieldState }) => {
            const radiusId = `${FORM_ID}-searchRadius`
            const valueLabelId = `${radiusId}-value`
            return (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor={radiusId}>{t("searchRadius")}</FieldLabel>
                  <span
                    id={valueLabelId}
                    className="text-sm font-medium tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                  >
                    {field.value} km
                  </span>
                </div>
                <Slider
                  id={radiusId}
                  min={1}
                  max={50}
                  step={1}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  aria-label={t("searchRadius")}
                  aria-describedby={valueLabelId}
                  aria-valuemin={1}
                  aria-valuemax={50}
                  aria-valuenow={field.value}
                  aria-valuetext={`${field.value} km`}
                />
                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
              </Field>
            )
          }}
        />

        <div className="flex justify-end">
          <Button type="submit" form={FORM_ID} variant="primary" disabled={isLoading || isGettingLocation}>
            {t("save")}
            {isLoading && <LoadingIcon />}
          </Button>
        </div>
      </FieldGroup>
    </form>
  )
}
