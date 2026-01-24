import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neon-blue disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "border border-glass-border bg-white/10 text-white shadow-glow hover:bg-white/20",
        outline: "border border-glass-border text-neon-blue hover:border-neon-blue",
        ghost: "text-white/70 hover:text-white"
      },
      size: {
        sm: "px-4 py-1",
        md: "px-6 py-2",
        lg: "px-8 py-3"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button ref={ref} className={cn(buttonVariants({ variant, size, className }))} {...props} />
));
Button.displayName = "Button";

export { Button, buttonVariants };
