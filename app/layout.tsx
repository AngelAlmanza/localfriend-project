import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LocalFriend Project",
  description: "LocalFriend Project",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body
        className={`${interSans.variable} antialiased`}
      >
        <NextIntlClientProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
