import * as React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "muted";
  size?: "sm" | "md" | "lg";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-brand-primary text-brand-primary-foreground hover:opacity-90 focus-visible:ring-brand-primary",
      outline:
        "border border-border-strong bg-transparent hover:bg-surface hover:text-surface-foreground focus-visible:ring-border-strong",
      ghost: "hover:bg-surface hover:text-surface-foreground focus-visible:ring-surface",
      muted: "bg-brand-muted text-brand-muted-foreground hover:opacity-80 focus-visible:ring-brand-muted",
    };

    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 py-2",
      lg: "h-12 px-8 text-lg",
    };

    return (
      <button className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))} ref={ref} {...props} />
    );
  }
);

Button.displayName = "Button";

export { Button };

