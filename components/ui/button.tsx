import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const base = "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none";
    const variants = {
      default: "bg-primary text-white hover:opacity-90",
      outline: "border border-black/10 bg-white hover:bg-black/5",
      ghost: "hover:bg-black/5"
    };
    const sizes = {
      sm: "h-9 px-4 text-sm",
      md: "h-11 px-6",
      lg: "h-12 px-8 text-lg"
    };
    return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
  }
);
Button.displayName = "Button";
