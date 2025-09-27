import z from 'zod';
import { waitlistSchema } from '../schemas/waitlist';

export type WaitlistDto = z.infer<typeof waitlistSchema>;
