"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { buildRegisterSchema, RegisterSchema } from "@/src/auth/schemas/register.schema"
import { AuthService } from "@/src/auth/services/AuthService"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { createClient } from "@/src/shared/lib/supabase/client"
import { SystemRole } from "@/src/shared/types/systemRoles"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { redirect, RedirectType, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

const FORM_ID = "register-form"

function RegisterPage() {
  const searchParams = useSearchParams()
  const registerAs = searchParams.get("registerAs") as Exclude<SystemRole, "admin"> | undefined
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Auth.register")
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(buildRegisterSchema({
      emailErrorMessage: t("emailErrorMessage"),
      passwordErrorMessage: t("passwordErrorMessage"),
      confirmPasswordErrorMessage: t("confirmPasswordErrorMessage"),
    })),
    defaultValues: {
      name: "",
      role: registerAs ?? "local",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const supabaseClient = createClient()
  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true)

    const result = await AuthService.register(data, supabaseClient)

    if (result.left) {
      toast.error(result.left.message)
    } else {
      toast.success(t("registerSuccess"))

      if (data.role === "local") {
        redirect("/locals/search", RedirectType.replace)
      } else {
        redirect("/workers/dashboard", RedirectType.replace)
      }
    }

    setIsLoading(false)
  }

  return (
    <Card className="min-w-md max-w-lg">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form id={FORM_ID} onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              control={form.control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-name`}>
                    {t("name")}
                  </FieldLabel>
                  <Input
                    id={`${FORM_ID}-name`}
                    {...field}
                    placeholder={t("name")}
                    aria-invalid={fieldState.invalid}
                    autoComplete="name"
                  />
                  {
                    fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )
                  }
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-email`}>
                    {t("email")}
                  </FieldLabel>
                  <Input
                    id={`${FORM_ID}-email`}
                    {...field}
                    placeholder={t("email")}
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                  />
                  {
                    fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )
                  }
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-password`}>
                    {t("password")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${FORM_ID}-password`}
                      type={showPassword ? "text" : "password"}
                      {...field}
                      placeholder={t("password")}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={t("togglePasswordVisibility")}
                        type="button"
                        title={t("togglePasswordVisibility")}
                        size="icon-sm"
                        className="cursor-pointer hover:bg-transparent"
                      >
                        {!showPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {
                    fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )
                  }
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={`${FORM_ID}-confirmPassword`}>
                    {t("confirmPassword")}
                  </FieldLabel>
                  <InputGroup>
                    <InputGroupInput
                      id={`${FORM_ID}-confirmPassword`}
                      type={showConfirmPassword ? "text" : "password"}
                      {...field}
                      placeholder={t("confirmPassword")}
                      aria-invalid={fieldState.invalid}
                      autoComplete="new-password"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={t("toggleConfirmPasswordVisibility")}
                        type="button"
                        title={t("toggleConfirmPasswordVisibility")}
                        size="icon-sm"
                        className="cursor-pointer hover:bg-transparent"
                      >
                        {!showConfirmPassword ? <EyeOff /> : <Eye />}
                      </InputGroupButton>
                    </InputGroupAddon>
                  </InputGroup>
                  {
                    fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )
                  }
                </Field>
              )}
            />
          </FieldGroup>

          <FieldGroup className="mt-4">
            <Controller
              control={form.control}
              name="role"
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend>
                    {t("roleLegend")}
                  </FieldLegend>
                  <FieldDescription>
                    {t("roleLegendDescription")}
                  </FieldDescription>

                  <RadioGroup
                    defaultValue="local"
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor={`${FORM_ID}-local`}>
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldTitle>
                            {t("local.title")}
                          </FieldTitle>
                          <FieldDescription>
                            {t("local.description")}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="local" id={`${FORM_ID}-local`} aria-invalid={fieldState.invalid} />
                      </Field>
                    </FieldLabel>

                    <FieldLabel htmlFor={`${FORM_ID}-worker`}>
                      <Field orientation="horizontal" data-invalid={fieldState.invalid}>
                        <FieldContent>
                          <FieldTitle>
                            {t("worker.title")}
                          </FieldTitle>
                          <FieldDescription>
                            {t("worker.description")}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem value="worker" id={`${FORM_ID}-worker`} aria-invalid={fieldState.invalid} />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                  {
                    fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )
                  }
                </FieldSet>
              )}
            />
          </FieldGroup>

        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="vertical">
          <Button type="submit" form={FORM_ID} variant="primary" disabled={isLoading}>
            {t("register")}
            {isLoading && <LoadingIcon />}
          </Button>
          <Button type="button" variant="link" form={FORM_ID} asChild={!isLoading} disabled={isLoading}>
            <Link href="/auth/login">
              {t("signIn")}
            </Link>
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
export default RegisterPage