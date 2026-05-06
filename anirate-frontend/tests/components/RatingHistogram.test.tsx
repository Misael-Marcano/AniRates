import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import RatingHistogram from "@/components/RatingHistogram";

describe("RatingHistogram", () => {
  it("shows empty state when sum=0", () => {
    render(<RatingHistogram distribution={Array(10).fill(0)} />);
    expect(screen.getByText(/Aún no hay ratings suficientes/i)).toBeInTheDocument();
  });

  it("renders avg when provided", () => {
    render(<RatingHistogram distribution={[0, 0, 0, 0, 0, 0, 5, 10, 5, 2]} avg={7.5} />);
    expect(screen.getByText("7.5")).toBeInTheDocument();
  });

  it("shows total ratings count", () => {
    const { container } = render(<RatingHistogram distribution={[1, 0, 0, 0, 0, 0, 0, 0, 0, 0]} />);
    expect(container.textContent).toMatch(/Basado en\s*1\s*rating/);
  });

  it("uses singular for 1 rating", () => {
    render(<RatingHistogram distribution={[1, 0, 0, 0, 0, 0, 0, 0, 0, 0]} />);
    expect(screen.getByText(/Basado en/)).toBeInTheDocument();
  });

  it("renders score labels 1-10", () => {
    const { container } = render(<RatingHistogram distribution={[1, 1, 1, 1, 1, 1, 1, 1, 1, 1]} />);
    for (let i = 1; i <= 10; i++) {
      expect(container.textContent).toContain(String(i));
    }
  });
});
