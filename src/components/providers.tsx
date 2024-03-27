'use client';

import { trpc } from '@/trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { PropsWithChildren, useState } from 'react';
import superjson from 'superjson';

export function getBaseUrl() {
  if (typeof window !== 'undefined')
    // browser should use relative path
    return '';

  if (process.env.VERCEL_URL)
    // reference for vercel.com
    return `https://${process.env.VERCEL_URL}`;

  if (process.env.RENDER_INTERNAL_HOSTNAME)
    // reference for render.com
    return `http://${process.env.RENDER_INTERNAL_HOSTNAME}:${process.env.PORT}`;

  // assume localhost
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

export default function Providers({ children }: PropsWithChildren) {
  // Use useState in the creation of the queryClient and the TRPCClient to ensure that each request gets a unique client when using SSR
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          // You can pass any HTTP headers you wish here
          // async headers() {
          //   return {
          //     authorization: getAuthCookie(),
          //   };
          // },
          transformer: superjson,
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
