'use client';

import { Button } from '@tasork/ui';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import Link from 'next/link';

const TRUST_POINTS = [
  { icon: ShieldCheck, label: 'Secure payments' },
  { icon: Timer, label: 'Proposal within 24h' },
  { icon: Sparkles, label: 'Manually reviewed, every time' },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_55%)]"
      />
      <div className="container flex flex-col items-center gap-8 py-24 text-center sm:py-32">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Now accepting new solution requests
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-balance font-display text-4xl font-bold leading-tight tracking-tight sm:text-6xl"
        >
          Describe it. <span className="gradient-text">We&apos;ll solve it.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="max-w-2xl text-balance text-lg text-muted-foreground"
        >
          Skip the freelancer search. Submit your project, get a custom-reviewed solution — price, timeline,
          and scope — from a managed team of experts, and track everything in one dashboard.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Button size="lg" asChild>
            <Link href="/submit-project">
              Get a Custom Solution
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/#how-it-works">See how it works</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 pt-4 text-sm text-muted-foreground"
        >
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              {label}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
