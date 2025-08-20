'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes';
import { WalletContextProvider } from '@/components/wallet/WalletProvider';
import { AuthProvider } from '@/contexts/AuthContext';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <WalletContextProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </WalletContextProvider>
    </NextThemesProvider>
  );
}
