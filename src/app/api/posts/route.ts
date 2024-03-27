import { getAuthSession } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const session = await getAuthSession();

  let followedCommunityIds: string[] = [];

  if (session) {
    const subscriptions = await prisma.subscription.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        community: true,
      },
    });

    followedCommunityIds = subscriptions.map(({ community }) => community.id);
  }

  try {
    const { communityName, limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
        communityName: z.string().nullish().optional(),
      })
      .parse({
        communityName: url.searchParams.get('communityName'),
        limit: url.searchParams.get('limit'),
        page: url.searchParams.get('page'),
      });

    let where = {};
    if (communityName) {
      // Specific community
      where = {
        community: {
          name: communityName,
        },
      };
    } else if (session) {
      // Followed communities
      where = {
        community: {
          id: {
            in: followedCommunityIds,
          },
        },
      };
    }

    const posts = await prisma.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        community: true,
        votes: true,
        author: true,
        comments: true,
      },
      where,
    });

    return new NextResponse(JSON.stringify(posts));
    // return NextResponse.json({ posts });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }

    return new NextResponse('Could not fetch posts.', {
      status: 500,
    });
  }
};
