import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-cyan-500/30 bg-cyan-500/15 text-cyan-400 hover:bg-cyan-500/25',
        secondary:
          'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700',
        destructive:
          'border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25',
        outline:
          'border-zinc-700 text-zinc-300 hover:bg-zinc-800',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
