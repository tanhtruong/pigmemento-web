import { z } from 'zod';
import {
  authResponseSchema,
  loginSchema,
  registerSchema,
} from '../schemas/auth';

// MARK: Login
export type LoginDto = z.infer<typeof loginSchema>;

// MARK: Register
export type RegisterDto = z.infer<typeof registerSchema>;
export type RegisterPayload = Omit<RegisterDto, 'confirmPassword'>;

// MARK: Auth Response
export type AuthResponse = z.infer<typeof authResponseSchema>;
