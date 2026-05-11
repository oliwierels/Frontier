import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Card = forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement> & { glow?: boolean }
>(({ className, glow, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-xl border border-white/8 bg-white/3 backdrop-blur-sm",
      glow && "shadow-lg shadow-violet-900/20 hover:shadow-violet-900/40 hover:border-violet-500/30 transition-all duration-300",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pt-6 pb-4", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-6 pb-6", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-6 pb-6 pt-0 border-t border-white/8 mt-4 pt-4", className)}
      {...props}
    />
  )
);
CardFooter.displayName = "CardFooter";
