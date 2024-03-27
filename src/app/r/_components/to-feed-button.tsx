'use client';

import { ChevronLeft } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { buttonVariants } from '../../../components/ui/button';

const getFeedPath = (path: string) => {
  const splitPath = path.split('/');

  if (splitPath.length === 3) return '/';
  else if (splitPath.length > 3) return `/${splitPath[1]}/${splitPath[2]}`;
  // Default path, just in case.
  else return '/';
};

export default function ToFeedButton() {
  const pathname = usePathname();

  // If path is '/r/xxx', go to '/'
  // If path is 'r/xxx/post/xxxxxxxxxxxxxxx', go to '/r/xxx'
  const feedPath = getFeedPath(pathname);

  return (
    <a href={feedPath} className={buttonVariants({ variant: 'ghost' })}>
      <ChevronLeft className="size-4 mr-1" />
      {feedPath === '/' ? 'Back home' : 'Back to community'}
    </a>
  );
}
