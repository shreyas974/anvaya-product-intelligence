import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/cn';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#E8703A] text-[#FFFBF7] shadow-sm hover:bg-[#D45D28]',
        secondary:
          'border-[rgba(120,90,70,0.15)] bg-[#F1ECE7] text-[#6B5E56] hover:bg-[#E8DFD5]',
        destructive:
          'border-[rgba(178,59,46,0.3)] bg-[#FBE3DE] text-[#B23B2E]',
        outline: 'text-[#2B2320] border-[rgba(120,90,70,0.18)] bg-[rgba(255,251,247,0.7)]',
        success:
          'border-[rgba(199,127,46,0.3)] bg-[#FBEEDD] text-[#C77F2E]',
        warning:
          'border-[rgba(194,87,31,0.3)] bg-[#FDEADE] text-[#C2571F]',
        info:
          'border-[rgba(184,134,59,0.3)] bg-[#FBEEDD] text-[#B8863B]',
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
