import { z } from 'zod';

export const PostSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be longer than 3 characters')
    .max(128, 'Title must be less than 128 characters'),
  communityId: z.string(),
  content: z.any(),
});

export type CreatePostPayload = z.infer<typeof PostSchema>;
