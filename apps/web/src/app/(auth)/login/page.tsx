'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, useToast } from '@tasork/ui';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';

import { apiClient } from '@/lib/api-client';
import { setSessionCookies } from '@/lib/session-cookies';
import { type LoginInput, loginSchema } from '@/lib/validation/auth';
import { useAuthStore } from '@/store/auth-store';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { setUser, setAccessToken } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  const mutation = useMutation({
    mutationFn: (values: LoginInput) => apiClient.post('/auth/login', values),
    onSuccess: (response) => {
      const { data } = response.data;
      console.log('✅ Login success!', data);
      
      // Set the session cookies so middleware can authenticate
      setAccessToken(data.accessToken);
      setUser(data.user);
      // Lets middleware recognize the session on the very next navigation —
      // see docs/session-cookies.ts. Must happen before the push, since
      // middleware checks cookies on the request that push() triggers.
      setSessionCookies(data.user.role);
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    },
    onError: () => {
      toast({
        variant: 'destructive',
        title: 'Login failed',
        description: 'Check your email and password and try again.',
      });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log in to track your projects and proposals.
        </p>
      </div>

      <Button variant="outline" className="w-full" type="button">
        <FcGoogle className="h-4 w-4" />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OR</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form
        onSubmit={handleSubmit((values) => mutation.mutate(values))}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          placeholder="you@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <div className="space-y-1.5">
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          className="w-full"
          loading={mutation.isPending}
        >
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link
          href="/register"
          className="font-medium text-primary hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <React.Suspense fallback={null}>
      <LoginForm />
    </React.Suspense>
  );
}
