import { z } from 'zod';

export const CommunitySchema = z.object({
  name: z
    .string()
    .min(3, 'Community name must be at least 3 characters long.')
    .max(20, 'Community name can not be longer than 20 characters.'),
});

export const CommunitySubscriptionSchema = z.object({
  communityId: z.string(),
});
