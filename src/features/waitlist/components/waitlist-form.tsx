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
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { ComponentProps } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';
import { waitlistSchema } from '../schemas/waitlist';
import { useWaitlist } from '../hooks/use-waitlist';
import { toast } from 'sonner';

const WaitlistForm = ({ className, ...props }: ComponentProps<'div'>) => {
  const form = useForm<z.infer<typeof waitlistSchema>>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      name: '',
      email: '',
    },
  });

  const { mutate: register, isPending, isError } = useWaitlist();

  const onSubmit = (data: z.infer<typeof waitlistSchema>) => {
    register(data, {
      onSuccess: () => {
        toast.success(
          `Hi, ${data.name}. Thank you for signing up for the waitlist!`,
        );
        form.reset();
      },
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="flex flex-col md:grid grid-cols-2 gap-5">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="i.e. The Dermatologist"
                      {...field}
                    />
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
                    <Input
                      type="email"
                      placeholder="i.e. dermatologist@pigmemento.app"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={isPending}>
            {isPending ? 'Signing up...' : 'Sign me up for the waitlist!'}
          </Button>
          {isError && (
            <p className="text-destructive">Registration failed. Try again.</p>
          )}
        </form>
      </Form>
    </div>
  );
};

export default WaitlistForm;
