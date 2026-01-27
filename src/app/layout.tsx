import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";
import { getLocaleFromCookies } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "PassVault QR",
  description: "Secure credential lifecycle and QR transfer management."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getLocaleFromCookies();

  return (
    <html lang={locale}>
      <body>
        <Providers initialLocale={locale}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
