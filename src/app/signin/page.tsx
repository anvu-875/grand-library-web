'use client';

import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeClosed } from 'lucide-react';
import { signInAction } from './action/signIn';

const signInSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().nonempty('Password is required'),
});

type FormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [seePassword, setSeePassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleShowPassword = () => {
    const input = passwordInputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const scrollLeft = input.scrollLeft;
      setSeePassword((prev) => {
        setTimeout(() => {
          input.focus();
          input.setSelectionRange(start, end);
          input.scrollLeft = scrollLeft;
        }, 0);
        return !prev;
      });
    } else {
      setSeePassword((prev) => !prev);
    }
  };

  const onSubmit = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(
        new Event('submit', { cancelable: true, bubbles: true })
      );
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-background'>
      <div className='absolute top-6 right-6'>
        <ThemeToggle />
      </div>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl'>Sign in to your account</CardTitle>
          <CardDescription>Enter your email below to sign in</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className='grid gap-4' action={signInAction} ref={formRef}>
              <div className='grid gap-2'>
                <FormField
                  control={form.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          autoComplete='email'
                          placeholder='m@example.com'
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className='grid gap-2'>
                <FormField
                  control={form.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type={seePassword ? 'text' : 'password'}
                          autoComplete='current-password'
                          className='pr-10'
                          {...field}
                          ref={(el) => {
                            field.ref(el);
                            passwordInputRef.current = el;
                          }}
                        />
                      </FormControl>
                      <Button
                        type='button'
                        variant='ghost'
                        className='absolute right-0 bottom-0 rounded-tl-none rounded-bl-none'
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                        onClick={handleShowPassword}
                      >
                        {seePassword ? <Eye /> : <EyeClosed />}
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className='flex flex-col gap-4'>
          <Button className='w-full' onClick={form.handleSubmit(onSubmit)}>
            Sign in
          </Button>
          <Separator className='my-4' />
          <div className='text-center text-sm text-gray-500'>
            <a href='/signup' className='underline'>
              Sign up with Google
            </a>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
