"use server";

import { cookies } from "next/headers";
import { UserPreferencesResponse } from "../interfaces/UserPreferences";

const COOKIE_NAME = "user-preferences";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function setUserPreferencesCookie(
  preferences: UserPreferencesResponse,
): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, JSON.stringify(preferences), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function getUserPreferencesCookie(): Promise<UserPreferencesResponse | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  if (!cookie?.value) return null;
  try {
    return JSON.parse(cookie.value) as UserPreferencesResponse;
  } catch {
    return null;
  }
}

export async function clearUserPreferencesCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
