"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  buildRegisterSchema,
  RegisterSchema,
} from "@/src/auth/schemas/register.schema";
import { AuthService } from "@/src/auth/services/AuthService";
import { LoadingIcon } from "@/src/shared/components/LoadingIcon";
import { createClient } from "@/src/shared/lib/supabase/client";
import { SystemRole } from "@/src/shared/types/systemRoles";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Eye, EyeOff, X } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { redirect, RedirectType, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

const FORM_ID = "register-form";

function RegisterPage() {
  const searchParams = useSearchParams();
  const registerAs = searchParams.get("registerAs") as
    | Exclude<SystemRole, "admin">
    | undefined;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const t = useTranslations("Auth.register");
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(
      buildRegisterSchema({
        nameErrorMessage: t("nameErrorMessage"),
        roleErrorMessage: t("roleErrorMessage"),
        emailErrorMessage: t("emailErrorMessage"),
        passwordErrorMessage: t("passwordErrorMessage"),
        passwordUppercaseErrorMessage: t("passwordUppercaseErrorMessage"),
        passwordNumberErrorMessage: t("passwordNumberErrorMessage"),
        passwordSpecialErrorMessage: t("passwordSpecialErrorMessage"),
        confirmPasswordErrorMessage: t("confirmPasswordErrorMessage"),
        termsAcceptedErrorMessage: t("termsAcceptedErrorMessage"),
      }),
    ),
    defaultValues: {
      name: "",
      role: registerAs ?? "local",
      email: "",
      password: "",
      confirmPassword: "",
      termsAccepted: undefined,
    },
  });

  const password = form.watch("password") ?? "";
  const termsAccepted = form.watch("termsAccepted");
  const passwordRequirements = [
    { label: t("passwordRequirements.minLength"), met: password.length >= 8 },
    { label: t("passwordRequirements.uppercase"), met: /[A-Z]/.test(password) },
    { label: t("passwordRequirements.number"), met: /[0-9]/.test(password) },
    {
      label: t("passwordRequirements.special"),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const supabaseClient = createClient();
  const onSubmit = async (data: RegisterSchema) => {
    setIsLoading(true);

    // Strip termsAccepted — not needed by the service
    const { termsAccepted: _, ...registerData } = data;
    const result = await AuthService.register(registerData, supabaseClient);

    if (result.left) {
      toast.error(t("genericRegisterError"));
    } else {
      toast.success(t("registerSuccess"));

      if (data.role === "local") {
        redirect("/locals/search", RedirectType.replace);
      } else {
        redirect("/workers/dashboard", RedirectType.replace);
      }
    }

    setIsLoading(false);
  };

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
                    data-testid="register-name-input"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                    data-testid="register-email-input"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                      autoComplete="new-password"
                      data-testid="register-password-input"
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
                  {password.length > 0 && (
                    <ul
                      className="mt-2 space-y-1 text-sm"
                      aria-label={t("passwordRequirements.title")}
                    >
                      {passwordRequirements.map((req) => (
                        <li
                          key={req.label}
                          className={`flex items-center gap-1.5 ${req.met ? "text-green-600" : "text-muted-foreground"}`}
                        >
                          {req.met ? (
                            <Check className="size-3.5 shrink-0" />
                          ) : (
                            <X className="size-3.5 shrink-0" />
                          )}
                          {req.label}
                        </li>
                      ))}
                    </ul>
                  )}
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                      data-testid="register-confirm-password-input"
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
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
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
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
                  <FieldLegend>{t("roleLegend")}</FieldLegend>
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
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent>
                          <FieldTitle>{t("local.title")}</FieldTitle>
                          <FieldDescription>
                            {t("local.description")}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value="local"
                          id={`${FORM_ID}-local`}
                          aria-invalid={fieldState.invalid}
                          aria-label={t("local.title")}
                        />
                      </Field>
                    </FieldLabel>

                    <FieldLabel htmlFor={`${FORM_ID}-worker`}>
                      <Field
                        orientation="horizontal"
                        data-invalid={fieldState.invalid}
                      >
                        <FieldContent>
                          <FieldTitle>{t("worker.title")}</FieldTitle>
                          <FieldDescription>
                            {t("worker.description")}
                          </FieldDescription>
                        </FieldContent>
                        <RadioGroupItem
                          value="worker"
                          id={`${FORM_ID}-worker`}
                          aria-invalid={fieldState.invalid}
                          aria-label={t("worker.title")}
                        />
                      </Field>
                    </FieldLabel>
                  </RadioGroup>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </FieldGroup>

          <FieldGroup className="mt-4">
            <Controller
              control={form.control}
              name="termsAccepted"
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                >
                  <Checkbox
                    id={`${FORM_ID}-terms`}
                    checked={field.value === true}
                    onCheckedChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    data-testid="register-terms-checkbox"
                  />
                  <FieldLabel
                    htmlFor={`${FORM_ID}-terms`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {t("termsAcceptedPrefix")}{" "}
                    <Dialog>
                      <DialogTrigger asChild>
                        <button
                          type="button"
                          className="underline text-primary hover:opacity-80 cursor-pointer"
                          onClick={(e) => e.preventDefault()}
                        >
                          {t("termsLink")}
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{t("termsDialogTitle")}</DialogTitle>
                        </DialogHeader>
                        <div className="text-sm text-muted-foreground max-h-80 overflow-y-auto space-y-3">
                          <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.</p>
                          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
                          <p>At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.</p>
                        </div>
                        <DialogFooter showCloseButton />
                      </DialogContent>
                    </Dialog>
                  </FieldLabel>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="vertical">
          <Button
            type="submit"
            form={FORM_ID}
            variant="primary"
            disabled={isLoading || termsAccepted !== true}
            data-testid="register-submit-btn"
          >
            {t("register")}
            {isLoading && <LoadingIcon />}
          </Button>
          <Button
            type="button"
            variant="link"
            form={FORM_ID}
            asChild={!isLoading}
            disabled={isLoading}
          >
            <Link href="/auth/login" data-testid="register-login-link">
              {t("signIn")}
            </Link>
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
}
export default RegisterPage;
