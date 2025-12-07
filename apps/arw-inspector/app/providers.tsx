'use client';

import * as React from 'react';

import { ThemeProvider } from 'next-themes';
import { TooltipProvider } from '@radix-ui/react-tooltip';

export function Providers({
  children
}: React.PropsWithChildren): React.JSX.Element {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <TooltipProvider>{children}</TooltipProvider>
    </ThemeProvider>
  );
}
