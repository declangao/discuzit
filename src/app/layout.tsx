import Navbar from '@/components/navbar';
import Providers from '@/components/providers';
import { Toaster } from '@/components/ui/sonner';
import { SITE_NAME } from '@/config';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    'A Reddit clone built with Next.js, TypeScript, Tailwind and tRPC.',
  icons: { icon: '/icon.png' },
};

export default function RootLayout({
  children,
  authModal,
}: Readonly<{
  children: React.ReactNode;
  authModal: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
      // class in body causes layout shift when using components like dropdown-menu
      // Solution is to move classname to a new div under body
      // https://github.com/shadcn-ui/ui/issues/977
      // className={cn(
      //   'min-h-screen pt-12 bg-slate-50 antialiased',
      //   inter.className
      // )}
      >
        <div
          className={cn(
            'min-h-screen pt-12 bg-slate-50 dark:bg-zinc-950 antialiased',
            inter.className
          )}
        >
          <Providers>
            <Navbar />

            {authModal}

            <div className="container max-w-7xl mx-auto h-full pt-8">
              {children}
            </div>

            <Toaster richColors />
          </Providers>
        </div>
      </body>
    </html>
  );
}
