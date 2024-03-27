'use client';

import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icons } from './icons';
import { Button } from './ui/button';

type Props = {
  className?: string;
};

export default function UserAuthForm({ className }: Props) {
  const [isLoading, setIsLoading] = useState(false);

  const loginWithGoogle = async () => {
    setIsLoading(true);

    try {
      await signIn('google');
    } catch (err) {
      toast.error('There was an error loggin in with Google', {
        description: 'Please try again later',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('flex justify-center', className)}>
      <Button
        onClick={loginWithGoogle}
        size="sm"
        isPending={isLoading}
        className="w-full"
      >
        {isLoading ? null : <Icons.google className="size-4 mr-2" />}
        Google
      </Button>
    </div>
  );
}
