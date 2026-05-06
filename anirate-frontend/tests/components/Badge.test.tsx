import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Badge from "@/components/Badge";

describe("Badge", () => {
  it("renders ANIME label by default for ANIME type", () => {
    render(<Badge type="ANIME" />);
    expect(screen.getByText("ANIME")).toBeInTheDocument();
  });

  it("renders MANGA label by default for MANGA type", () => {
    render(<Badge type="MANGA" />);
    expect(screen.getByText("MANGA")).toBeInTheDocument();
  });

  it("uses custom label when provided", () => {
    render(<Badge type="genre" label="Acción" />);
    expect(screen.getByText("Acción")).toBeInTheDocument();
  });

  it("falls back to genre style when no type", () => {
    const { container } = render(<Badge label="Drama" />);
    const span = container.querySelector("span");
    expect(span).toHaveTextContent("Drama");
  });
});
