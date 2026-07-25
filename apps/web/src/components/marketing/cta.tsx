'use client';

import { Button } from '@tasork/ui';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className="container pb-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="gradient-brand relative overflow-hidden rounded-2xl px-8 py-16 text-center shadow-lg sm:px-16"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(255,255,255,0.15),_transparent_60%)]"
        />
        <h2 className="text-balance font-display text-3xl font-bold text-primary-foreground sm:text-4xl">
          Ready to get your solution?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-balance text-primary-foreground/90">
          Submit your project today and receive a custom-reviewed proposal — no searching, no negotiating.
        </p>
        <Button size="lg" variant="secondary" className="mt-8" asChild>
          <Link href="/submit-project">
            Submit a Project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>
    </section>
  );
}
