import GeneralFeed from '@/components/general-feed';
import LoggedInFeed from '@/components/logged-in-feed';
import { buttonVariants } from '@/components/ui/button';
import { SITE_NAME } from '@/config';
import { getAuthSession } from '@/lib/auth';
import { HomeIcon } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const session = await getAuthSession();

  return (
    <>
      <h1 className="font-bold text-3xl md:text-4xl">Your feed</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
        {session ? <LoggedInFeed /> : <GeneralFeed />}

        <div className="overflow-hidden h-fit rounded-lg border border-gray-200 dark:border-gray-800 order-first md:order-last">
          <div className="bg-zinc-200 dark:bg-zinc-800 px-6 py-4">
            <p className="font-semibold py-3 flex items-center gap-1.5">
              <HomeIcon className="size-4" />
              Home
            </p>
          </div>

          <div className="-my-3 divide-y px-6 py-4 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500 dark:text-primary-foreground/80">
                Your personal {SITE_NAME} homepage. Come here to check in with
                your favourite communities.
              </p>
            </div>

            <Link
              href="/create"
              className={buttonVariants({
                className: 'w-full mt-4 mb-6',
              })}
            >
              Create Community
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
