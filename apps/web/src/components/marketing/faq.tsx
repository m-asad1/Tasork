'use client';

import * as Accordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How is Tasork different from a freelance marketplace?',
    a: 'You never search for or negotiate with individual freelancers. You submit your project once, and our team reviews it, assigns the right people, and sends you a single, professional proposal.',
  },
  {
    q: 'How long does it take to get a proposal?',
    a: 'Most requests receive a proposal within 24 hours. More complex projects may take longer, and we\u2019ll let you know if that\u2019s the case.',
  },
  {
    q: 'What if I\u2019m not satisfied with the delivered work?',
    a: 'Every proposal includes a clearly stated revision policy. If something is outside scope, we\u2019ll always tell you before doing extra work \u2014 never after.',
  },
  {
    q: 'Is my payment secure?',
    a: 'Yes. Payments are processed through a PCI-compliant provider (Stripe), and larger projects can be split into milestone-based payments rather than a single lump sum.',
  },
  {
    q: 'What kinds of projects can I submit?',
    a: 'Tasork supports a wide range of legitimate digital work \u2014 development, design, academic support, business documents, automation, content, and more. If you\u2019re unsure, submit it and we\u2019ll tell you.',
  },
  {
    q: 'Is my project information kept confidential?',
    a: 'Yes. All client information and files are handled under our confidentiality policy, and NDAs are available for Enterprise Solutions.',
  },
];

export function FAQ() {
  return (
    <section id="faq" className="container py-20 sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>

      <Accordion.Root type="single" collapsible className="mx-auto mt-10 max-w-2xl divide-y divide-border">
        {FAQS.map((faq) => (
          <Accordion.Item key={faq.q} value={faq.q} className="py-2">
            <Accordion.Header>
              <Accordion.Trigger className="group flex w-full items-center justify-between py-3 text-left text-sm font-semibold">
                {faq.q}
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Content className="overflow-hidden text-sm text-muted-foreground data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
              <p className="pb-3">{faq.a}</p>
            </Accordion.Content>
          </Accordion.Item>
        ))}
      </Accordion.Root>
    </section>
  );
}
