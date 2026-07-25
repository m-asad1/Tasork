'use client';

import { Avatar, AvatarFallback, Card, CardContent } from '@tasork/ui';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Amara O.',
    role: 'Founder, early-stage startup',
    quote:
      'The proposal was more thorough than what I got from three separate freelancer quotes combined. Everything was clear before I paid a cent.',
    initials: 'AO',
  },
  {
    name: 'Daniel K.',
    role: 'Graduate student',
    quote:
      'I needed research formatting done fast and correctly. The dashboard kept me updated the whole time, no chasing anyone for status.',
    initials: 'DK',
  },
  {
    name: 'Priya S.',
    role: 'Marketing lead, SMB',
    quote:
      'Having one place to submit, approve, and pay for the project made this the easiest vendor relationship on our team this year.',
    initials: 'PS',
  },
];

export function Testimonials() {
  return (
    <section className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Trusted by people who just want it done right
        </h2>
      </div>

      <div className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-3">
        {TESTIMONIALS.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="flex h-full flex-col justify-between">
              <CardContent className="pt-6">
                <div className="mb-3 flex gap-0.5 text-warning">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star key={idx} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-foreground/90">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-5 flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>{t.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
