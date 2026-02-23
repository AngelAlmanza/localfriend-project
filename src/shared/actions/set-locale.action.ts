"use server"

import { cookies } from "next/headers"

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365

export async function setLocaleAction(locale: string) {
  const cookieStore = await cookies()
  cookieStore.set("locale", locale, {
    path: "/",
    maxAge: ONE_YEAR_SECONDS,
    sameSite: "lax",
  })
}
