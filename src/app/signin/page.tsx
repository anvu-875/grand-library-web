'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
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
import { Eye, EyeClosed, Loader } from 'lucide-react';
import { signInAction } from './action/signIn';
import { ErrorCode } from '@/lib/serviceReturn';
import { signInSchema } from '@/lib/schema-validation';

type FormValues = z.infer<typeof signInSchema>;

export default function SignInPage() {
  const [seePassword, setSeePassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [signInState, SIAction, isSignInPending] = useActionState(
    signInAction,
    undefined
  );

  const signinForm = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (!signInState) return;
    switch (signInState.code) {
      case ErrorCode.UNPROCESSABLE_ENTITY: {
        const errorFields = signInState.content as Record<
          string,
          string[] | undefined
        >;
        if (errorFields.email) {
          signinForm.setError('email', {
            message: errorFields.email?.[0],
          });
        }
        if (errorFields.password) {
          signinForm.setError('password', {
            message: errorFields.password?.[0],
          });
        }
        break;
      }
      case ErrorCode.UNAUTHORIZED: {
        setErrorMsg(
          signInState.content.message || 'Unknown Authentication Error'
        );
        break;
      }
      case ErrorCode.INTERNAL_SERVER_ERROR: {
        setErrorMsg(
          signInState.content.message ||
            'Internal Server Error, please try again later'
        );
        break;
      }
    }
  }, [signInState, signinForm]);

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

  const onSinginSubmit = () => {
    if (formRef.current) {
      setErrorMsg(null);
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
          {errorMsg && (
            <div className='mb-3 text-destructive text-sm'>{errorMsg}</div>
          )}
          <Form {...signinForm}>
            <form className='grid gap-4' action={SIAction} ref={formRef}>
              <div className='grid gap-2'>
                <FormField
                  control={signinForm.control}
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
                  control={signinForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem className='relative'>
                      <FormLabel>Password</FormLabel>
                      <FormControl className='relative'>
                        <Input
                          autoComplete='current-password'
                          type={seePassword ? 'text' : 'password'}
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
                        className='absolute right-0 top-5.5 rounded-tl-none rounded-bl-none'
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
          <Button
            className='w-full'
            onClick={signinForm.handleSubmit(onSinginSubmit)}
            disabled={isSignInPending}
          >
            {isSignInPending && <Loader className='animate-spin' />}
            {isSignInPending ? 'Signing in...' : 'Sign in'}
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
