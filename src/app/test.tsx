import { MessagesSquare } from 'lucide-react';
import { ImageResponse } from 'next/og';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

// Image generation
export default function Icon() {
  return new ImageResponse(
    <MessagesSquare className="size-4 text-red-300" />,
    // ImageResponse JSX element
    // <div
    //   style={{
    //     fontSize: 24,
    //     // background: 'white',
    //     width: '100%',
    //     height: '100%',
    //     display: 'flex',
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     // color: 'black',
    //   }}
    // >
    //   <MessagesSquare className="size-4 text-red-300" />
    // </div>
    // ImageResponse options
    {
      // For convenience, we can re-use the exported icons size metadata
      // config to also set the ImageResponse's width and height.
      ...size,
    }
  );
}
