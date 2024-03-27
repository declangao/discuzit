'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCustomToast } from '@/hooks/use-custom-toast';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export default function CreateCommunityPage() {
  const [input, setInput] = useState('');

  const router = useRouter();
  const { loginToast } = useCustomToast();

  const { mutate: createCommunity, isPending } =
    trpc.community.create.useMutation({
      onSuccess: ({ community }) => {
        router.push(`/r/${community.name}`);
        toast.success('Community created!');
      },
      onError: (err) => {
        if (err.data?.zodError) {
          return toast.error('Invalid community name.', {
            // description: err.data.zodError.issues[0].message,
            description: 'Please choose a name between 3 and 20 characters.',
          });
        }

        if (err.data?.code === 'UNAUTHORIZED') {
          return loginToast();
        }

        if (err.data?.code === 'CONFLICT') {
          return toast.error('Community already exists.', {
            description: 'Please choose a differnet community name.',
          });
        }

        toast.error('Something went wrong...', {
          description: 'Could not create community. Please try again later.',
        });
      },
    });

  return (
    <div className="container flex items-center h-full max-w-3xl">
      <div className="relative bg-white dark:bg-zinc-900 w-full h-fit p-4 rounded-lg space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Create a community</h1>
        </div>

        <hr className="bg-zinc-500 h-px" />

        <div>
          <p className="text-lg font-medium">Name</p>
          <p className="text-xs pb-2">
            Community names including capitalization cannot be changed.
          </p>

          <div className="relative">
            <p className="absolute text-sm left-0 w-8 inset-y-0 grid place-items-center text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="secondary" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            onClick={() => createCommunity({ name: input })}
            isPending={isPending}
            disabled={input.length === 0}
          >
            Create
          </Button>
        </div>
      </div>
    </div>
  );
}
