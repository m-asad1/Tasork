'use client';

import { Button } from '@tasork/ui';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle2, Mail, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import * as React from 'react';

import { apiClient } from '@/lib/api-client';

export default function VerifyEmailPage() {
  return (
    <React.Suspense fallback={null}>
      <VerifyEmailForm />
    </React.Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const verifyMutation = useMutation({
    mutationFn: (t: string) => apiClient.post('/auth/verify-email', { token: t }),
  });

  const resendMutation = useMutation({
    mutationFn: () => apiClient.post('/auth/resend-verification', { email }),
  });

  React.useEffect(() => {
    if (token) verifyMutation.mutate(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (token) {
    if (verifyMutation.isPending) {
      return <p className="text-center text-sm text-muted-foreground">Verifying your email…</p>;
    }
    if (verifyMutation.isSuccess) {
      return (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
          <h1 className="font-display text-2xl font-bold">Email verified</h1>
          <p className="text-sm text-muted-foreground">Your account is ready to go.</p>
          <Button asChild className="w-full">
            <Link href="/dashboard">Go to dashboard</Link>
          </Button>
        </div>
      );
    }
    return (
      <div className="space-y-4 text-center">
        <XCircle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="font-display text-2xl font-bold">Verification failed</h1>
        <p className="text-sm text-muted-foreground">This link may have expired. Request a new one below.</p>
        <Button className="w-full" onClick={() => resendMutation.mutate()} loading={resendMutation.isPending}>
          Resend verification email
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="font-display text-2xl font-bold">Verify your email</h1>
      <p className="text-sm text-muted-foreground">
        We sent a verification link to <span className="font-medium text-foreground">{email ?? 'your email'}</span>.
        Click it to activate your account.
      </p>
      <Button variant="outline" className="w-full" onClick={() => resendMutation.mutate()} loading={resendMutation.isPending}>
        Resend email
      </Button>
      {resendMutation.isSuccess && <p className="text-xs text-success">Verification email resent.</p>}
    </div>
  );
}
