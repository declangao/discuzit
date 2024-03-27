import { commentRouter } from './routers/comment';
import { communityRouter } from './routers/community';
import { postRouter } from './routers/post';
import { settingsRouter } from './routers/settings';
import { router } from './trpc';

export const appRouter = router({
  community: communityRouter,
  post: postRouter,
  comment: commentRouter,
  settings: settingsRouter,
});

export type AppRouter = typeof appRouter;
