import z from 'zod';

export const waitlistSchema = z.object({
  name: z.string().min(1, { message: 'Must contain at least 1 character(s)' }),
  email: z.string().email(),
});
