import ToFeedButton from '@/app/r/_components/to-feed-button';
import CommunityInfoCard from '../_components/community-info-card';

type Props = {
  children: React.ReactNode;
  params: {
    slug: string;
  };
};

export default async function Layout({ children, params: { slug } }: Props) {
  return (
    <div className="sm:container max-w-7xl mx-auto h-full">
      <div>
        <ToFeedButton />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4 md:gap-x-4 py-6">
          <div className="flex flex-col col-span-2 space-y-6">{children}</div>

          <CommunityInfoCard slug={slug} />
        </div>
      </div>
    </div>
  );
}
