import { SITE_NAME } from '@/config';
import { getAuthSession } from '@/lib/auth';
import Link from 'next/link';
import AccountNavDropdown from './account-nav-dropdown';
import { Icons } from './icons';
import SearchBar from './search-bar';
import ThemeToggle from './theme-toggle';
import { buttonVariants } from './ui/button';

export default async function Navbar() {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 h-fit bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-900 z-10 py-2">
      <div className="container max-w-7xl h-full mx-auto flex items-center justify-between gap-2">
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="size-8 sm:size-6" />
          <p className="hidden text-zinc-700 dark:text-zinc-100 text-sm font-medium md:block">
            {SITE_NAME}
          </p>
        </Link>

        <SearchBar />

        <div className="flex items-center gap-x-4">
          <ThemeToggle />

          {session?.user ? (
            <AccountNavDropdown user={session.user} />
          ) : (
            <Link href="/sign-in" className={buttonVariants()}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
