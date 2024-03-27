import Editor from '@/components/editor';
import { Button } from '@/components/ui/button';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';

type Props = {
  params: {
    slug: string;
  };
};

export default async function SubmitPage({ params: { slug } }: Props) {
  const community = await prisma.community.findFirst({
    where: {
      name: slug,
    },
  });
  if (!community) notFound();

  return (
    <div className="flex flex-col items-start gap-6">
      <div className="border-b border-gray-200 dark:border-gray-700 pb-5">
        <div className="-ml-2 -mt-2 flex flex-wrap items-baseline">
          <h3 className="ml-2 mt-2 text-lg font-semibold leading-6 text-gray-900 dark:text-gray-100">
            Create Post
          </h3>
          <p className="ml-2 mt-1 truncate text-sm text-muted-foreground">
            in r/{slug}
          </p>
        </div>
      </div>

      <Editor communityId={community.id} />

      <div className="w-full flex justify-end">
        <Button type="submit" className="w-full" form="community-post-form">
          Post
        </Button>
      </div>
    </div>
  );
}
