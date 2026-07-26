import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import * as React from 'react';

import { cn } from '../lib/utils';

export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ' +
    'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ' +
    'focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        outline: 'border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    // Radix's <Slot> requires exactly one React element child so it can clone
    // props (className, ref, ...) onto it. Conditionally rendering the loading
    // icon as a sibling of `children` (`{loading && <Loader2 />}{children}`)
    // makes that two children — `false` still counts — which breaks `asChild`
    // usages like `<Button asChild><Link>...</Link></Button>` at build time
    // with "Slot failed to slot onto its children". Collapsing to a single
    // node keeps both the plain-button and asChild cases working.
    const content = loading ? (
      <>
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {children}
      </>
    ) : (
      children
    );

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        // `disabled` isn't a valid attribute on the arbitrary element `asChild`
        // renders (e.g. a Next.js <Link>), so only apply it for the real <button>.
        {...(!asChild && { disabled: disabled || loading })}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);
Button.displayName = 'Button';
