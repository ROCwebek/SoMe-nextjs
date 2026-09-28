import { ComponentProps } from "react";

// The feed and the new-post form render the same bordered button; className
// carries the few per-use extras (e.g. self-start inside the form's flex column).
export const Button = ({ className = "", ...props }: ComponentProps<"button">) => (
  <button
    className={`rounded border border-line px-3 py-1.5 hover:bg-surface-hover ${className}`}
    {...props}
  />
);
