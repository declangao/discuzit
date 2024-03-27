'use client';

import { ImageIcon, Link2 } from 'lucide-react';
import { Session } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import UserAvatar from '../../../components/user-avatar';

type Props = {
  session: Session | null;
};

export default function CreatePostMini({ session }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const goToSubmit = () => {
    router.push(pathname + '/submit');
  };

  return (
    <div className="overflow-hidden rounded-md bg-white dark:bg-zinc-900 shadow">
      <div className="h-full px-6 py-4 flex justify-between gap-4">
        <div className="relative">
          <UserAvatar
            user={{
              name: session?.user.name || null,
              image: session?.user.image || null,
            }}
          />

          <span className="absolute bottom-0 right-0 rounded-full size-3 bg-green-500 outline outline-2 outline-white" />
        </div>

        <Input readOnly onClick={goToSubmit} placeholder="Create post" />

        <Button
          onClick={goToSubmit}
          variant="ghost"
          className="hidden md:block"
        >
          <ImageIcon className="text-zinc-600" />
        </Button>

        <Button
          onClick={goToSubmit}
          variant="ghost"
          className="hidden md:block"
        >
          <Link2 className="text-zinc-600" />
        </Button>
      </div>
    </div>
  );
}
