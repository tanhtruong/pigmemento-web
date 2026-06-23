import { ComponentProps, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight } from 'lucide-react';
import { motion, useAnimationControls, useReducedMotion } from 'motion/react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';
import { motionTokens, SHAKE_KEYFRAMES_X } from '@/lib/motion-tokens';
import { LoginDto } from '../types/auth';
import { loginSchema } from '../schemas/auth';
import { useAuthRedirectTarget, useLogin } from '../hooks/use-auth';
import { useTransitionNavigate } from '@/components/motion/transition-conductor';
import { SubmitRing } from '@/components/motion/submit-ring';
import { commitOrigin } from '@/utils/commit-origin';

export const LoginForm = ({ className, ...props }: ComponentProps<'div'>) => {
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: login, isPending, isError } = useLogin();
  const startTransition = useTransitionNavigate();
  const destination = useAuthRedirectTarget();
  const submitRef = useRef<HTMLButtonElement>(null);
  const reducedMotion = useReducedMotion();
  const shakeControls = useAnimationControls();

  const onSubmit = (data: LoginDto) => {
    login(data, {
      onSuccess: () =>
        startTransition({
          kind: 'enter-app',
          origin: commitOrigin(submitRef.current),
          destination,
        }),
      onError: () => {
        // The rejection jolt — never a bloom; amber never lies (#47).
        if (!reducedMotion) {
          void shakeControls.start({
            x: SHAKE_KEYFRAMES_X,
            transition: motionTokens.shake,
          });
        }
      },
    });
  };

  return (
    <div className={cn(className)} {...props}>
      <motion.div animate={shakeControls} className="flex flex-col gap-5">
        <Form {...form}>
          {/* eslint-disable-next-line react-hooks/refs -- onSubmit reads submitRef.current only inside the onSuccess event callback (navigation origin), never during render */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-foreground text-xs font-medium tracking-wide uppercase">
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@hospital.org"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-incorrect text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-baseline justify-between">
                    <FormLabel className="text-foreground text-xs font-medium tracking-wide uppercase">
                      Password
                    </FormLabel>
                    <Link
                      to="/"
                      className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    >
                      Trouble signing in?
                    </Link>
                  </div>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-incorrect text-xs" />
                </FormItem>
              )}
            />

            <Button
              ref={submitRef}
              type="submit"
              disabled={isPending}
              className="relative w-full justify-center"
              size="lg"
            >
              {isPending ? (
                'Signing in…'
              ) : (
                <>
                  Sign in
                  <ArrowRight />
                </>
              )}
              <SubmitRing active={isPending} />
            </Button>

            {isError && (
              <p role="alert" className="text-incorrect text-center text-xs">
                Couldn’t sign you in. Check your email and password.
              </p>
            )}
          </form>
        </Form>

        <p className="text-muted-foreground text-center text-xs">
          New here?{' '}
          <Link
            to={paths.auth.register.getHref()}
            className="text-foreground underline-offset-4 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
