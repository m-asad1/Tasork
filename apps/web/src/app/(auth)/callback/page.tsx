'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect } from 'react';

import { apiClient } from '@/lib/api-client';
import { setSessionCookies } from '@/lib/session-cookies';
import { useAuthStore } from '@/store/auth-store';

function CallbackContent() {
  const searchParams = useSearchParams();
  const { setAccessToken, setUser } = useAuthStore();
  const token = searchParams.get('accessToken');

  useEffect(() => {
    if (token) {
      setAccessToken(token);
      // Fetch user data with the token
      apiClient
        .get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const user = response.data.data;
          setUser(user);
          setSessionCookies(user.role);
          window.location.href = '/dashboard';
        })
        .catch(() => {
          window.location.href = '/login';
        });
    } else {
      window.location.href = '/login';
    }
  }, [token, setAccessToken, setUser]);

  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-center text-sm text-muted-foreground">Completing authentication...</p>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="text-center text-sm text-muted-foreground">Loading...</p>}>
      <CallbackContent />
    </Suspense>
  );
}