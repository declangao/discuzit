'use client';

import { uploadFiles } from '@/lib/uploadthing';
import { CreatePostPayload, PostSchema } from '@/schemas/post';
import { trpc } from '@/trpc/client';
import type TEditorJS from '@editorjs/editorjs';
import { zodResolver } from '@hookform/resolvers/zod';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { toast } from 'sonner';

type Props = {
  communityId: string;
};

export default function Editor({ communityId }: Props) {
  const _titleRef = useRef<HTMLTextAreaElement>(null);

  const pathname = usePathname();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostPayload>({
    resolver: zodResolver(PostSchema),
    defaultValues: {
      communityId,
      title: '',
      content: null,
    },
  });

  const ref = useRef<TEditorJS>();

  const initializeEditor = useCallback(async () => {
    const EditorJS = (await import('@editorjs/editorjs')).default;
    const Header = (await import('@editorjs/header')).default;
    const Embed = (await import('@editorjs/embed')).default;
    const Table = (await import('@editorjs/table')).default;
    const List = (await import('@editorjs/list')).default;
    const Code = (await import('@editorjs/code')).default;
    const LinkTool = (await import('@editorjs/link')).default;
    const InlineCode = (await import('@editorjs/inline-code')).default;
    const ImageTool = (await import('@editorjs/image')).default;

    if (!ref.current) {
      const editor = new EditorJS({
        holder: 'editor',
        onReady() {
          ref.current = editor;
        },
        placeholder: 'Type here to write your post...',
        inlineToolbar: true,
        data: {
          blocks: [],
        },
        tools: {
          header: Header,
          linkTool: {
            class: LinkTool,
            config: {
              endpoint: '/api/link',
            },
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                async uploadByFile(file: File) {
                  const [res] = await uploadFiles('imageUploader', {
                    files: [file],
                  });

                  return {
                    success: 1,
                    file: {
                      url: res.url,
                    },
                  };
                },
              },
            },
          },
          list: List,
          code: Code,
          inlineCode: InlineCode,
          table: Table,
          embed: Embed,
        },
      });
    }
  }, []);

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  useEffect(() => {
    if (Object.keys(errors).length) {
      for (const [_key, value] of Object.entries(errors)) {
        toast.error('Please check your input', {
          description: (value as { message: string }).message,
        });
      }
    }
  }, [errors]);

  useEffect(() => {
    const init = async () => {
      await initializeEditor();
      setTimeout(() => {
        _titleRef.current?.focus();
      }, 0);
    };

    if (isMounted) {
      init();

      return () => {
        ref.current?.destroy();
        ref.current = undefined;
      };
    }
  }, [isMounted, initializeEditor]);

  const { mutate: createPost } = trpc.post.create.useMutation({
    onSuccess: () => {
      const newPathname = pathname.split('/').slice(0, -1).join('/');
      router.push(newPathname);
      router.refresh();
      return toast.success('Your post has been published');
    },
    onError: (err) => {
      if (err.data?.code === 'FORBIDDEN')
        return toast.error('Failed to post.', {
          description:
            'You need to subscribe to this community in order to post',
        });

      return toast.error('Something went wrong', {
        description: 'Your post was not published. Please try again later.',
      });
    },
  });

  const onSubmit = async (data: CreatePostPayload) => {
    const blocks = await ref.current?.save();

    const payload: CreatePostPayload = {
      title: data.title,
      content: blocks,
      communityId,
    };

    createPost(payload);
  };

  if (!isMounted) return null;

  // Share ref with react-hook-form
  const { ref: titleRef, ...rest } = register('title');

  return (
    <div className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
      <form
        id="community-post-form"
        onSubmit={handleSubmit(onSubmit)}
        className="w-fit"
      >
        <div className="prose prose-stone dark:prose-invert">
          <TextareaAutosize
            ref={(elm) => {
              titleRef(elm);
              // @ts-ignore
              _titleRef.current = elm;
            }}
            {...rest}
            placeholder="Title"
            className="w-full resize-none appearance-none overflow-hidden bg-transparent text-5xl font-bold border-none focus:outline-none"
          />

          <hr className="m-0" />

          <div id="editor" className="min-h-[500px]" />
        </div>
      </form>
    </div>
  );
}
