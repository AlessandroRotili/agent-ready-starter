"use client";
import type { ButtonHTMLAttributes } from "react";
export function SubmitButton({
  pending,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { pending: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending}
      {...props}
    >
      {pending ? "Attendi..." : children}
    </button>
  );
}
