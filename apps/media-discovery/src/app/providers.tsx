'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ARWProvider } from '@agent-ready-web/nextjs-plugin/components';
import { useState, type ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ARWProvider config={{ priority: 'high', purpose: 'media-discovery' }}>
        {children}
      </ARWProvider>
    </QueryClientProvider>
  );
}
