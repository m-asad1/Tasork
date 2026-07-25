'use client';

import { motion } from 'framer-motion';

const STEPS = [
  { number: '01', title: 'Submit your project', description: 'Describe what you need and upload any files or requirements — takes a few minutes.' },
  { number: '02', title: 'Get a custom solution', description: 'Our team reviews it and sends a proposal: price, timeline, deliverables, and revision policy.' },
  { number: '03', title: 'Approve & pay securely', description: 'Accept the proposal and complete the advance payment to kick things off.' },
  { number: '04', title: 'Track & receive delivery', description: 'Follow progress in your dashboard, message the team, and receive your finished work.' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
          <p className="mt-3 text-muted-foreground">From idea to delivery in four straightforward steps.</p>
        </div>

        <div className="relative mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" aria-hidden="true" />
          {STEPS.map((step, i) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="relative flex flex-col items-start gap-3"
            >
              <span className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full bg-primary font-display text-sm font-bold text-primary-foreground shadow-sm">
                {step.number}
              </span>
              <h3 className="text-base font-semibold">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
