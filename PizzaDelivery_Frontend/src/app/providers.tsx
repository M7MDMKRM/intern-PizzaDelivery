"use client";

import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";
import { LanguageProvider } from "@/lib/LanguageContext";

import { SmoothScrollProvider } from "@/components/common/SmoothScrollProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 2, // 2 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const initialize = useAuthStore((state) => state.initialize);

  React.useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <LanguageProvider>
      <QueryClientProvider client={queryClient}>
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster position="top-center" richColors closeButton />
      </QueryClientProvider>
    </LanguageProvider>
  );
}
