'use client';

import { SWRConfig } from 'swr';
import { ReactNode } from 'react';

interface SWRProviderProps {
  children: ReactNode;
}

export const SWRProvider = ({ children }: SWRProviderProps) => {
  return (
    <SWRConfig
      value={{
        fetcher: async (url: string) => {
          const response = await fetch(url);
          if (!response.ok) {
            const error = new Error('Błąd podczas pobierania danych');
            // Dodaj dodatkowe informacje o błędzie
            (error as any).info = await response.json();
            (error as any).status = response.status;
            throw error;
          }
          return response.json();
        },
        onError: (error) => {
          console.error('SWR Error:', error);
          // Tutaj możesz dodać globalne obsługiwanie błędów np. toast
        },
        // Globalne opcje SWR
        revalidateOnFocus: false,
        revalidateOnReconnect: true,
        refreshInterval: 0, // Wyłącz auto refresh
        dedupingInterval: 2000,
        errorRetryCount: 2,
        errorRetryInterval: 5000,
        shouldRetryOnError: (error) => {
          // Nie retry dla 404 lub błędów klienta
          return error.status !== 404 && error.status < 500;
        },
      }}
    >
      {children}
    </SWRConfig>
  );
};