'use client';

import { UsernamePayload, UsernameSchema } from '@/schemas/username';
import { trpc } from '@/trpc/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Button } from './ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';

type Props = {
  user: Pick<User, 'id' | 'username'>;
};

export default function UsernameForm({ user }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UsernamePayload>({
    resolver: zodResolver(UsernameSchema),
    defaultValues: {
      name: user.username || '',
    },
  });

  const router = useRouter();

  const { mutate: updateUsername, isPending } =
    trpc.settings.changeUsername.useMutation({
      onSuccess: () => {
        toast.success('Your username has been updated.');
        router.refresh();
      },
      onError: (err) => {
        if (err.data?.code === 'CONFLICT')
          return toast.error('Username already taken.', {
            description: 'Please choose a differnet one.',
          });

        toast.error('Something went wrong.', {
          description: 'Please try again later.',
        });
      },
    });

  return (
    <form onSubmit={handleSubmit((data) => updateUsername(data))}>
      <Card>
        <CardHeader>
          <CardTitle>Your username</CardTitle>
          <CardDescription>
            Please enter a display name you are comfortable with.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/</span>
            </div>

            <Label htmlFor="name" className="sr-only">
              Name
            </Label>
            <Input
              id="name"
              size={32}
              className="w-[400px] pl-6"
              {...register('name')}
            />

            {errors?.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>

        <CardFooter>
          <Button isPending={isPending} disabled={!!errors.name}>
            Change name
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
