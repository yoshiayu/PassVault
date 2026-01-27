"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";
import I18nProvider from "@/components/i18n-provider";
import type { Locale } from "@/lib/i18n/messages";

export default function Providers({ children, initialLocale }: { children: ReactNode; initialLocale?: Locale }) {
  const [client] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={client}>
      <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
    </QueryClientProvider>
  );
}
