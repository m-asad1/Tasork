'use client';

import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@tasork/ui';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { Logo } from '@/components/navigation/logo';
import { ThemeToggle } from '@/components/theme-toggle';

const SERVICE_CATEGORIES = [
  { label: 'Web & App Development', href: '/services/web-development', blurb: 'Websites, MVPs, and full products' },
  { label: 'Design & Branding', href: '/services/design', blurb: 'UI/UX, logos, brand systems' },
  { label: 'Academic & Research', href: '/services/academic', blurb: 'Editing, tutoring, research support' },
  { label: 'Automation & AI', href: '/services/automation', blurb: 'Workflows, bots, integrations' },
  { label: 'Business & Documents', href: '/services/business', blurb: 'Reports, presentations, consulting' },
  { label: 'Content & Marketing', href: '/services/content', blurb: 'Copy, graphics, campaigns' },
];

const NAV_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Blog', href: '/blog' },
  { label: 'FAQ', href: '/faq' },
];

export function Navbar() {
  const [scrolled, setScrolled] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        scrolled
          ? 'border-b border-border bg-background/80 backdrop-blur-lg shadow-sm'
          : 'border-b border-transparent bg-background/0'
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" aria-label="Tasork home">
          <Logo />
        </Link>

        {/* Desktop nav */}
        <NavigationMenu.Root className="relative hidden lg:flex">
          <NavigationMenu.List className="flex items-center gap-1">
            <NavigationMenu.Item>
              <NavigationMenu.Trigger className="flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/10 hover:text-foreground focus:outline-none">
                Services
              </NavigationMenu.Trigger>
              <NavigationMenu.Content className="absolute left-0 top-full w-[560px] rounded-xl border border-border bg-popover p-4 shadow-lg animate-fade-up">
                <div className="grid grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="rounded-lg p-3 transition-colors hover:bg-accent/10"
                    >
                      <p className="text-sm font-semibold">{cat.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{cat.blurb}</p>
                    </Link>
                  ))}
                </div>
              </NavigationMenu.Content>
            </NavigationMenu.Item>

            {NAV_LINKS.map((link) => (
              <NavigationMenu.Item key={link.href}>
                <Link
                  href={link.href}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent/10 hover:text-foreground"
                >
                  {link.label}
                </Link>
              </NavigationMenu.Item>
            ))}
          </NavigationMenu.List>
          <NavigationMenu.Viewport />
        </NavigationMenu.Root>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setSearchOpen((o) => !o)} aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>
          <ThemeToggle />

          <div className="hidden items-center gap-2 lg:flex">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/submit-project">Submit a Project</Link>
            </Button>
          </div>

          {/* Mobile drawer */}
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader className="flex flex-row items-center justify-between">
                <DrawerTitle>Menu</DrawerTitle>
                <DrawerClose asChild>
                  <Button variant="ghost" size="icon" aria-label="Close menu">
                    <X className="h-5 w-5" />
                  </Button>
                </DrawerClose>
              </DrawerHeader>
              <nav className="flex flex-col gap-1 px-4 pb-8">
                <p className="px-3 pb-1 pt-2 text-xs font-semibold uppercase text-muted-foreground">Services</p>
                {SERVICE_CATEGORIES.map((cat) => (
                  <Link key={cat.href} href={cat.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
                    {cat.label}
                  </Link>
                ))}
                <div className="my-2 h-px bg-border" />
                {NAV_LINKS.map((link) => (
                  <Link key={link.href} href={link.href} className="rounded-md px-3 py-2 text-sm hover:bg-accent/10">
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Button variant="outline" asChild>
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/submit-project">Submit a Project</Link>
                  </Button>
                </div>
              </nav>
            </DrawerContent>
          </Drawer>
        </div>
      </div>

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-border bg-background"
          >
            <div className="container flex items-center gap-3 py-3">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                autoFocus
                type="search"
                placeholder="Search services, blog posts, FAQs…"
                className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
