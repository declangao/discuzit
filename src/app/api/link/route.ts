import { NextRequest, NextResponse } from 'next/server';

export const GET = async (req: NextRequest) => {
  const url = new URL(req.url);
  const href = url.searchParams.get('url');

  if (!href) return new NextResponse('Invalid href', { status: 400 });

  const res = await fetch(href);
  const html = await res.text();

  const titleMatch = html.match(/<title>(.*?)<\/title>/);
  const title = titleMatch ? titleMatch[1] : '';

  const descriptionMatch = html.match(
    /<meta name="description" content="(.*?)"/
  );
  const description = descriptionMatch ? descriptionMatch[1] : '';

  const imageMatch = html.match(/<meta property="og:image" content="(.*?)"/);
  const imageUrl = imageMatch ? imageMatch[1] : '';

  return NextResponse.json({
    success: 1,
    meta: {
      title,
      description,
      image: {
        url: imageUrl,
      },
    },
  });
};
