import { AvatarProps } from '@radix-ui/react-avatar';
import { User as UserIcon } from 'lucide-react';
import { User } from 'next-auth';
import Image from 'next/image';
import { Avatar, AvatarFallback } from './ui/avatar';

type Props = AvatarProps & {
  user: Pick<User, 'name' | 'image'>;
};

export default function UserAvatar({ user, ...props }: Props) {
  return (
    <Avatar {...props}>
      {user.image ? (
        <div className="relative aspect-square h-full w-full">
          <Image
            src={user.image}
            alt="Profile picture"
            fill
            referrerPolicy="no-referrer"
          />
        </div>
      ) : (
        <AvatarFallback>
          <span className="sr-only">{user?.name}</span>
          <UserIcon className="size-4" />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
