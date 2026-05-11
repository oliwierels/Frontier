import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500",
        "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
        "transition-colors duration-200 text-sm",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "w-full px-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 resize-none",
      "focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50",
      "transition-colors duration-200 text-sm",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
