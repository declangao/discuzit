import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export const useCustomToast = () => {
  const router = useRouter();

  const loginToast = () => {
    toast.warning('Login required', {
      description: 'You need to be logged in to do that.',
      action: {
        label: 'Login',
        onClick: () => router.push('/sign-in'),
      },
    });
  };

  return { loginToast };
};
