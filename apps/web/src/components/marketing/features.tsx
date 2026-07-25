'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@tasork/ui';
import { motion } from 'framer-motion';
import { Clock, FileCheck2, MessagesSquare, ShieldCheck, Sparkles, Wallet } from 'lucide-react';

const FEATURES = [
  {
    icon: FileCheck2,
    title: 'One submission, full clarity',
    description: 'Describe your project once. Get a scoped, priced, and timelined proposal — no back-and-forth negotiation.',
  },
  {
    icon: Sparkles,
    title: 'Manually reviewed',
    description: 'Every request is evaluated by our team before a proposal is written — no automated, generic pricing.',
  },
  {
    icon: Wallet,
    title: 'Secure, staged payments',
    description: 'Pay in stages tied to milestones, with clear invoices and a transparent refund policy.',
  },
  {
    icon: MessagesSquare,
    title: 'Centralized communication',
    description: 'Message your project team directly from your dashboard — no scattered emails or chat apps.',
  },
  {
    icon: Clock,
    title: 'Real progress tracking',
    description: 'Follow every milestone from submission to delivery, with status updates you can actually trust.',
  },
  {
    icon: ShieldCheck,
    title: 'Confidential by default',
    description: 'Your files and project details are handled under a strict confidentiality policy, always.',
  },
];

export function Features() {
  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need, nothing you don&apos;t
        </h2>
        <p className="mt-3 text-muted-foreground">
          Tasork replaces freelancer-hunting with a professional, agency-managed workflow.
        </p>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
