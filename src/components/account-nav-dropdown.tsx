'use client';

import { User } from 'next-auth';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import UserAvatar from './user-avatar';

type Props = {
  user: Pick<User, 'name' | 'email' | 'image'>;
};

export default function AccountNavDropdown({ user }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
          className="size-8"
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <div className="flex justify-start items-center gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/">Feed</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href="/create">Create community</Link>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            Settings
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={() => {
            // Add { callbackUrl: '/sign-in' | `${window.location.origin}/sign-in` } to customize redirect url. Overridden by authOptions.callbacks.redirect.
            signOut();
          }}
          className="cursor-pointer"
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
