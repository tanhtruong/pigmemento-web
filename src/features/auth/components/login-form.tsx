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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { LoginDto } from '../types/auth';
import { loginSchema } from '../schemas/auth';
import { useLogin } from '../hooks/use-auth';

export const LoginForm = ({ className, ...props }: ComponentProps<'div'>) => {
  const form = useForm<LoginDto>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate: login, isPending, isError } = useLogin();

  const onSubmit = (data: LoginDto) => {
    login(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between">
                  <FormLabel>Password</FormLabel>
                  <Link
                    to="/"
                    className="text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <Input
                    className="w-full"
                    type="password"
                    placeholder="Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
          {isError && (
            <p className="text-destructive">Login failed. Try again.</p>
          )}
          <p className="text-sm ">
            Don't have an account and want to join Pigmemento?{' '}
            <Link
              to={paths.auth.register.getHref()}
              className="underline underline-offset-2"
            >
              Sign up here!
            </Link>
          </p>
        </form>
      </Form>
      <div className="text-pretty text-center text-xs text-muted-foreground">
        By continuing, you agree to our{' '}
        <Link
          to="/tos"
          className="underline underline-offset-2 hover:text-primary"
        >
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link
          to="/privacy"
          className="underline underline-offset-2 hover:text-primary"
        >
          Privacy Policy
        </Link>
        .
      </div>
    </div>
  );
};
