// @vitest-environment jsdom
import React from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { DemoWorkspace } from "@/components/workspace/demo-workspace";
afterEach(cleanup);
it("adds and removes an example activity without a database", () => {
  render(<DemoWorkspace />);
  fireEvent.change(screen.getByLabelText("Titolo"), {
    target: { value: "Nuova attivita" },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Aggiungi" }).closest("form")!,
  );
  expect(screen.getByText("Nuova attivita")).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Elimina Nuova attivita" }),
  );
  expect(screen.queryByText("Nuova attivita")).not.toBeInTheDocument();
});
it("rejects whitespace-only titles", () => {
  render(<DemoWorkspace />);
  fireEvent.change(screen.getByLabelText("Titolo"), {
    target: { value: "   " },
  });
  fireEvent.submit(
    screen.getByRole("button", { name: "Aggiungi" }).closest("form")!,
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Inserisci un titolo");
});
