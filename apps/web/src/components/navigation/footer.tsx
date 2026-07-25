'use client';

import { Button, Input } from '@tasork/ui';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaXTwitter } from 'react-icons/fa6';
import Link from 'next/link';
import * as React from 'react';

import { Logo } from '@/components/navigation/logo';

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'How It Works', href: '/#how-it-works' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Services', href: '/services' },
      { label: 'Submit a Project', href: '/submit-project' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Support',
    links: [
      { label: 'FAQ', href: '/faq' },
      { label: 'Help Center', href: '/support' },
      { label: 'Status', href: '/status' },
      { label: 'Contact Support', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Refund Policy', href: '/legal/refunds' },
      { label: 'Cookie Policy', href: '/legal/cookies' },
    ],
  },
];

const SOCIALS = [
  { icon: FaXTwitter, href: 'https://x.com/tasork', label: 'X (Twitter)' },
  { icon: FaLinkedinIn, href: 'https://linkedin.com/company/tasork', label: 'LinkedIn' },
  { icon: FaInstagram, href: 'https://instagram.com/tasork', label: 'Instagram' },
  { icon: FaFacebookF, href: 'https://facebook.com/tasork', label: 'Facebook' },
];

export function Footer() {
  const [email, setEmail] = React.useState('');
  const [submitted, setSubmitted] = React.useState(false);

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Wired to POST /newsletter/subscribe once the API endpoint ships.
    setSubmitted(true);
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-14">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-6">
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Describe your project. We&apos;ll scope it, price it, and deliver it — through a professional,
              managed team, not a marketplace.
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold">{col.title}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-xl border border-border bg-background p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold">Stay in the loop</p>
            <p className="text-sm text-muted-foreground">Product updates and useful guides. No spam.</p>
          </div>
          {submitted ? (
            <p className="text-sm font-medium text-success">You&apos;re subscribed — thank you!</p>
          ) : (
            <form onSubmit={handleSubscribe} className="flex w-full max-w-sm gap-2">
              <Input
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button type="submit">Subscribe</Button>
            </form>
          )}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Tasork. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">Built for legitimate digital projects, worldwide.</p>
        </div>
      </div>
    </footer>
  );
}
