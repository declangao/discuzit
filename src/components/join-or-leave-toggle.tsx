'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { toast } from 'sonner';
import { Button } from './ui/button';

type Props = {
  communityId: string;
  communityName: string;
  isSubscribed: boolean;
};

export default function JoinOrLeaveToggle({
  communityId,
  communityName,
  isSubscribed,
}: Props) {
  const { loginToast } = useCustomToast();
  const router = useRouter();
  const isMobile = useIsMobile();

  const { mutate: subscribe, isPending: isSubscribePending } =
    trpc.community.subscribe.useMutation({
      onSuccess: () => {
        startTransition(() => router.refresh());
        toast.success('Subscribed', {
          description: `You're now subscribed to r/${communityName}`,
        });
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return loginToast();
        }

        if (err.data?.code === 'BAD_REQUEST') {
          return toast.error('Failed to subscribe', {
            description: err.message,
          });
        }

        toast.error('Something went wrong.', {
          description: 'Please try again later.',
        });
      },
    });

  const { mutate: unsubscribe, isPending: isUnsubscribePending } =
    trpc.community.unsubscribe.useMutation({
      onSuccess: () => {
        startTransition(() => router.refresh());
        toast.success('Unsubscribed', {
          description: `You're now unsubscribed from r/${communityName}`,
        });
      },
      onError: (err) => {
        if (err.data?.code === 'UNAUTHORIZED') {
          return loginToast();
        }

        if (err.data?.code === 'BAD_REQUEST') {
          return toast.error('Failed to unsubscribe', {
            description: err.message,
          });
        }

        toast.error('Something went wrong.', {
          description: 'Please try again later.',
        });
      },
    });

  return isSubscribed ? (
    <Button
      onClick={() => unsubscribe({ communityId })}
      isPending={isUnsubscribePending}
      size={isMobile ? 'sm' : 'default'}
      className="md:w-full mt-1"
    >
      {isMobile ? 'Leave' : 'Leave community'}
    </Button>
  ) : (
    <Button
      onClick={() => subscribe({ communityId })}
      isPending={isSubscribePending}
      size={isMobile ? 'sm' : 'default'}
      className="md:w-full mt-1"
    >
      {isMobile ? 'Join' : 'Join to post'}
    </Button>
  );
}
