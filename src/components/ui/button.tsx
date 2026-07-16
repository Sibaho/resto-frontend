"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ui-spec §4 — touch-first buttons, every variant ≥ 44pt tall.
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-[transform,background-color] duration-100 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 select-none",
  {
    variants: {
      variant: {
        primary: "bg-accent text-white hover:bg-accent-hover active:bg-accent-pressed shadow-[0_4px_12px_rgba(0,0,0,0.25)]",
        secondary: "bg-surface text-ink border border-line hover:bg-surface-2",
        ghost: "bg-transparent text-accent hover:bg-white/5",
        destructive: "bg-transparent text-danger hover:bg-danger/10",
      },
      size: {
        lg: "h-[52px] px-6 text-[15px]",
        md: "h-11 px-5 text-[15px]",
        sm: "h-9 px-3.5 text-sm rounded-sm",
        icon: "h-11 w-11 rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
