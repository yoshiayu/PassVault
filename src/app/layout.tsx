import type { Metadata } from "next";
import Providers from "@/app/providers";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "PassVault QR",
  description: "Secure credential lifecycle and QR transfer management."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
