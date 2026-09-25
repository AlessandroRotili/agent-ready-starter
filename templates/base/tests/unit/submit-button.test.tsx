// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { SubmitButton } from "@/components/ui/submit-button";
afterEach(cleanup);
it("prevents repeat submission and restores the action after completion", () => {
  const { rerender } = render(<SubmitButton pending>Salva</SubmitButton>);
  expect(screen.getByRole("button")).toBeDisabled();
  expect(screen.getByRole("button")).toHaveAttribute("aria-busy", "true");
  rerender(<SubmitButton pending={false}>Salva</SubmitButton>);
  expect(screen.getByRole("button", { name: "Salva" })).toBeEnabled();
});
