'use client';

import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@tasork/ui';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';

const TIERS = [
  {
    name: 'Starter Solutions',
    description: 'Small, well-defined projects',
    price: 'From $99',
    featured: false,
    features: ['Manual project review', '1 revision included', 'Standard delivery timeline', 'Email support'],
  },
  {
    name: 'Professional Solutions',
    description: 'Most projects and ongoing work',
    price: 'Custom quote',
    featured: true,
    features: [
      'Priority manual review',
      '3 revisions included',
      'Milestone-based payments',
      'Dedicated project workspace',
      'Priority support',
    ],
  },
  {
    name: 'Enterprise Solutions',
    description: 'Large or multi-phase projects',
    price: "Let's talk",
    featured: false,
    features: [
      'Dedicated account manager',
      'Custom revision policy',
      'Flexible payment terms',
      'SLA-backed delivery',
      'Confidentiality agreement (NDA)',
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 py-20 sm:py-28">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Fair pricing, scoped to your project
          </h2>
          <p className="mt-3 text-muted-foreground">
            No fixed price lists — every quote reflects the actual effort your project needs.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Card className={tier.featured ? 'relative border-primary shadow-lg ring-1 ring-primary' : 'relative'}>
                {tier.featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>
                )}
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <p className="pt-3 font-display text-3xl font-bold">{tier.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5">
                    {tier.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={tier.featured ? 'primary' : 'outline'} asChild>
                    <Link href="/submit-project">Get a Custom Solution</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
