'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, useToast } from '@tasork/ui';
import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import { apiClient } from '@/lib/api-client';
import { type ResetPasswordInput, resetPasswordSchema } from '@/lib/validation/auth';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({ resolver: zodResolver(resetPasswordSchema) });

  const mutation = useMutation({
    mutationFn: (values: ResetPasswordInput) => apiClient.post('/auth/reset-password', { ...values, token }),
    onSuccess: () => {
      toast({ variant: 'success', title: 'Password updated', description: 'You can now log in with your new password.' });
      router.push('/login');
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Link expired or invalid', description: 'Please request a new reset link.' });
    },
  });

  if (!token) {
    return (
      <div className="space-y-3 text-center">
        <h1 className="font-display text-2xl font-bold">Invalid reset link</h1>
        <p className="text-sm text-muted-foreground">This password reset link is missing or malformed.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Set a new password</h1>
        <p className="mt-1 text-sm text-muted-foreground">Choose a strong password you haven&apos;t used before.</p>
      </div>

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <Input
          label="New password"
          type="password"
          placeholder="••••••••"
          hint="At least 8 characters, one uppercase letter, one number."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm new password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Reset password
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={null}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}
