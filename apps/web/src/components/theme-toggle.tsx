'use client';

import { Button } from '@tasork/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Laptop, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

const MODES = ['light', 'dark', 'system'] as const;
type Mode = (typeof MODES)[number];

const ICONS: Record<Mode, React.ElementType> = { light: Sun, dark: Moon, system: Laptop };

/**
 * Cycles Light → Dark → System with an animated icon crossfade + rotate.
 * Renders nothing until mounted to avoid a hydration mismatch with the
 * server-rendered theme (next-themes recommendation).
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="h-10 w-10" aria-hidden="true" />;
  }

  const current = (theme as Mode) ?? 'system';
  const Icon = ICONS[current];

  function cycle() {
    const next = MODES[(MODES.indexOf(current) + 1) % MODES.length];
    setTheme(next);
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      aria-label={`Switch theme (current: ${current})`}
      title={`Theme: ${current}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={current}
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.2 }}
          className="flex"
        >
          <Icon className="h-5 w-5" />
        </motion.span>
      </AnimatePresence>
    </Button>
  );
}
