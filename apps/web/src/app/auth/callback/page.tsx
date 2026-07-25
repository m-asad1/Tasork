'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';

import { apiClient } from '@/lib/api-client';
import { setSessionCookies } from '@/lib/session-cookies';
import { useAuthStore } from '@/store/auth-store';

/**
 * Landing point for AuthController#googleCallback (apps/api). The API sets
 * the httpOnly refresh cookie on its own origin and redirects here with a
 * short-lived access token in the query string; this page stores it, fetches
 * the profile, sets the middleware session cookies, and forwards to the
 * dashboard. The token never touches localStorage or a URL the user keeps.
 */
function OAuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const accessToken = searchParams.get('accessToken');
  const { setAccessToken, setUser } = useAuthStore();

  const { data, error } = useQuery({
    queryKey: ['oauth-callback', accessToken],
    enabled: !!accessToken,
    retry: false,
    queryFn: async () => {
      const { data } = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return data;
    },
  });

  React.useEffect(() => {
    if (!accessToken) {
      router.replace('/login');
      return;
    }
    if (data) {
      setAccessToken(accessToken);
      setUser(data);
      setSessionCookies(data.role);
      // Strip the token from the URL before landing on the dashboard.
      router.replace('/dashboard');
    }
    if (error) {
      router.replace('/login');
    }
  }, [accessToken, data, error, router, setAccessToken, setUser]);

  return <p className="text-center text-sm text-muted-foreground">Signing you in…</p>;
}

export default function AuthCallbackPage() {
  return (
    <React.Suspense fallback={null}>
      <OAuthCallback />
    </React.Suspense>
  );
}
