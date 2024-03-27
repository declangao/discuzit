'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';

const Output = dynamic(
  async () => (await import('editorjs-react-renderer')).default,
  {
    ssr: false,
  }
);

const style = {
  paragraph: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
  },
};

const customImageRenderer = ({ data }: any) => {
  const src = data.file.url;

  return (
    <div className="relative w-full min-h-[15rem]">
      <Image src={src} alt="Image" fill className="object-contain" />
    </div>
  );
};

const customCodeRenderer = ({ data }: any) => {
  return (
    <pre className="bg-gray-800 rounded-md p-4">
      <code className="text-gray-100 text-sm">{data.code}</code>
    </pre>
  );
};

const renderers = {
  image: customImageRenderer,
  code: customCodeRenderer,
};

type Props = {
  content: any;
};

export default function EditorOutput({ content }: Props) {
  return (
    <Output
      renderers={renderers}
      style={style}
      data={content}
      className="text-sm"
    />
  );
}
