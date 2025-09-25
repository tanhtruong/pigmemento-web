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
import { RegisterDto } from '../types/auth';
import { registerSchema } from '../schemas/auth';
import { useRegister } from '../hooks/use-auth';

const RegisterForm = ({ className, ...props }: ComponentProps<'div'>) => {
  const form = useForm<RegisterDto>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { mutate: register, isPending, isError } = useRegister();

  const onSubmit = (data: RegisterDto) => {
    const { confirmPassword, ...dto } = data;
    register(dto);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="Name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Signing up...' : 'Sign up'}
          </Button>
          {isError && (
            <p className="text-destructive">Registration failed. Try again.</p>
          )}
          <p className="text-sm ">
            Already have an account?{' '}
            <Link
              to={paths.auth.login.getHref()}
              className="underline underline-offset-2"
            >
              Log in here!
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

export default RegisterForm;
