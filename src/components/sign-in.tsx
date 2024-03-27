import { SITE_NAME } from '@/config';
import Link from 'next/link';
import { Icons } from './icons';
import UserAuthForm from './user-auth-form';

export default function SignIn() {
  return (
    <div className="container mx-auto w-full flex flex-col justify-center space-y-6 sm:w-[400px]">
      <div className="flex flex-col space-y-2 text-center">
        <Icons.logo className="mx-auto size-6" />
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm max-w-xs mx-auto">
          By continuing, you are setting up a {SITE_NAME} account and agree to
          our User Agreement and Privacy Policy.
        </p>

        <UserAuthForm />

        <p className="px-8 text-center text-sm text-zinc-700 dark:text-zinc-200">
          New to {SITE_NAME}?{' '}
          <Link
            href="/sign-up"
            className="hover:text-zinc-800 dark:hover:text-primary text-sm underline underline-offset-4"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
