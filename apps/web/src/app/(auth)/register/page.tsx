'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, useToast } from '@tasork/ui';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { FcGoogle } from 'react-icons/fc';

import { apiClient } from '@/lib/api-client';
import { type RegisterInput, registerSchema } from '@/lib/validation/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });

  const mutation = useMutation({
    mutationFn: (values: RegisterInput) => apiClient.post('/auth/register', values),
    onSuccess: (_data, variables) => {
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Registration failed', description: 'That email may already be in use.' });
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-muted-foreground">Start submitting projects and getting custom solutions.</p>
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

      <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
        <Input label="Full name" placeholder="Jane Doe" error={errors.fullName?.message} {...register('fullName')} />
        <Input label="Email" type="email" placeholder="you@email.com" error={errors.email?.message} {...register('email')} />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          hint="At least 8 characters, one uppercase letter, one number."
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-input" {...register('agreeToTerms')} />
          I agree to the{' '}
          <Link href="/legal/terms" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="/legal/privacy" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </label>
        {errors.agreeToTerms && <p className="text-xs font-medium text-destructive">{errors.agreeToTerms.message}</p>}

        <Button type="submit" className="w-full" loading={mutation.isPending}>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
