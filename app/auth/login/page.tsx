"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { buildLoginSchema, LoginSchema } from "@/src/auth/schemas/login.schema"
import { AuthService } from "@/src/auth/services/AuthService"
import { LoadingIcon } from "@/src/shared/components/LoadingIcon"
import { createClient } from "@/src/shared/lib/supabase/client"
import { zodResolver } from "@hookform/resolvers/zod"
import { Eye, EyeOff } from "lucide-react"
import { useTranslations } from "next-intl"
import Link from "next/link"
import { redirect, RedirectType } from "next/navigation"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"

const FORM_ID = "login-form"

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations("Auth.login")
  const form = useForm<LoginSchema>({
    resolver: zodResolver(buildLoginSchema({
      emailErrorMessage: t("emailErrorMessage"),
      passwordErrorMessage: t("passwordErrorMessage"),
    })),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const supabaseClient = createClient()
  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true)

    const result = await AuthService.login(data, supabaseClient)

    if (result.left) {
      if (result.left.code === "INACTIVE_ACCOUNT") {
        toast.error(t("inactiveAccountError"))
      } else {
        toast.error(t("genericLoginError"))
      }
    } else {
      toast.success(t("loginSuccess"))

      const role = result.right.session.role
      if (role === "admin") {
        redirect("/admin/dashboard", RedirectType.replace)
      } else if (role === "worker") {
        redirect("/workers/dashboard", RedirectType.replace)
      } else {
        redirect("/locals/search", RedirectType.replace)
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
                    data-testid="login-email-input"
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
                      data-testid="login-password-input"
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
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="vertical">
          <Button type="submit" form={FORM_ID} variant="primary" disabled={isLoading} data-testid="login-submit-btn">
            {t("login")}
            {isLoading && <LoadingIcon />}
          </Button>
          <Button type="button" variant="link" asChild={!isLoading} disabled={isLoading}>
            <Link href="/auth/register" data-testid="login-register-link">
              {t("signUp")}
            </Link>
          </Button>
          <Button type="button" variant="link" asChild={!isLoading} disabled={isLoading}>
            <Link href="/auth/forgot-password">
              {t("forgotPassword")}
            </Link>
          </Button>
        </Field>
      </CardFooter>
    </Card>
  )
}
export default LoginPage