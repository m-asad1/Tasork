import Link from 'next/link';

import { Logo } from '@/components/navigation/logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-between p-8 sm:p-12">
        <Link href="/" aria-label="Tasork home">
          <Logo />
        </Link>
        <div className="mx-auto w-full max-w-sm py-12">{children}</div>
        <p className="text-center text-xs text-muted-foreground lg:text-left">
          &copy; {new Date().getFullYear()} Tasork. All rights reserved.
        </p>
      </div>

      <div className="relative hidden overflow-hidden bg-primary lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.15),_transparent_50%)]"
        />
        <div className="flex h-full flex-col items-start justify-end p-16">
          <blockquote className="max-w-md text-2xl font-medium leading-snug text-primary-foreground">
            &ldquo;The proposal was more thorough than three freelancer quotes combined.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-primary-foreground/80">Amara O. — Startup Founder</p>
        </div>
      </div>
    </div>
  );
}
