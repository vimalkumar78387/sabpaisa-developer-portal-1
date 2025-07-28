import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium relative overflow-hidden transition-all duration-300 ease-out disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive before:absolute before:inset-0 before:bg-white before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-10 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 active:scale-95 transform transition-all duration-200",
        destructive:
          "bg-gradient-to-r from-destructive to-red-600 text-white shadow-lg shadow-destructive/25 hover:shadow-xl hover:shadow-destructive/30 hover:scale-105 active:scale-95 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40",
        outline:
          "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground hover:border-primary/50 hover:scale-105 active:scale-95 focus-visible:ring-primary dark:border-input dark:hover:bg-accent transition-all duration-200",
        secondary:
          "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 hover:scale-105 active:scale-95 transition-all duration-200",
        ghost:
          "hover:bg-accent hover:text-accent-foreground hover:scale-105 active:scale-95 focus-visible:ring-primary dark:hover:bg-accent transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline focus-visible:ring-primary focus-visible:ring-offset-2 relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full",
        gradient:
          "bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 text-white shadow-lg shadow-purple/25 hover:shadow-xl hover:shadow-purple/30 hover:scale-105 active:scale-95 bg-size-200 hover:bg-pos-100 transition-all duration-300",
        glow:
          "bg-primary text-primary-foreground shadow-lg hover:shadow-primary/50 hover:scale-105 active:scale-95 hover:shadow-2xl transition-all duration-300 before:absolute before:inset-0 before:rounded-md before:opacity-0 before:transition-opacity before:duration-300 hover:before:opacity-20 before:bg-gradient-to-r before:from-transparent before:via-white before:to-transparent"
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        sm: "h-8 rounded-md gap-1.5 px-3 has-[>svg]:px-2.5 text-xs",
        lg: "h-12 rounded-lg px-8 has-[>svg]:px-6 text-base",
        xl: "h-14 rounded-xl px-10 has-[>svg]:px-8 text-lg",
        icon: "size-9"
      },
      animation: {
        none: "",
        pulse: "animate-pulse-slow",
        bounce: "hover:animate-bounce-slow",
        wiggle: "hover:animate-wiggle",
        glow: "hover-glow"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      animation: "none"
    }
  }
);

interface ButtonProps extends React.ComponentProps<"button">, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
}

function Button({
  className,
  variant,
  size,
  animation,
  asChild = false,
  loading = false,
  loadingText = "Loading...",
  children,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // When using asChild, we need to handle icons and loading differently
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(
          buttonVariants({ variant, size, animation, className }),
          loading && "cursor-not-allowed",
          "group relative overflow-hidden"
        )}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  const buttonContent = loading ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      {loadingText && <span className="ml-1">{loadingText}</span>}
    </>
  ) : (
    children
  );

  return (
    <button
      data-slot="button"
      className={cn(
        buttonVariants({ variant, size, animation, className }),
        loading && "cursor-not-allowed",
        "group relative overflow-hidden"
      )}
      disabled={isDisabled}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center">
        {buttonContent}
      </span>
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 h-full w-full scale-0 rounded-md transition-all duration-300 group-active:scale-100 group-active:bg-white group-active:opacity-20" />
    </button>
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
