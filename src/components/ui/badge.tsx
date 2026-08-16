import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils.ts';

const badgeVariants = cva(
  'inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-stone-400 focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-stone-700 bg-stone-800 text-stone-200 hover:bg-stone-700',
        secondary:
          'border-stone-700 bg-[#1a1a20] text-stone-300 hover:bg-[#22222a]',
        destructive:
          'border-red-500/30 bg-red-500/15 text-red-400 hover:bg-red-500/25',
        outline:
          'border-stone-800/80 text-stone-300 hover:bg-[#1a1a20]',
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
