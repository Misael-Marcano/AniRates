import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import StarRating from "@/components/StarRating";

describe("StarRating", () => {
  it("renders 5 stars", () => {
    const { container } = render(<StarRating value={6} />);
    const stars = container.querySelectorAll("span");
    const starOnly = Array.from(stars).filter((s) => s.textContent === "★");
    expect(starOnly).toHaveLength(5);
  });

  it("shows score label when value > 0", () => {
    render(<StarRating value={8} />);
    expect(screen.getByText("8 / 10")).toBeInTheDocument();
  });

  it("hides label when value = 0", () => {
    render(<StarRating value={0} />);
    expect(screen.queryByText(/\/ 10/)).not.toBeInTheDocument();
  });

  it("calls onRate with calculated score on click when interactive", () => {
    const onRate = vi.fn();
    const { container } = render(<StarRating value={0} interactive onRate={onRate} />);
    const stars = container.querySelectorAll("span");
    fireEvent.click(stars[2]);
    expect(onRate).toHaveBeenCalledWith(6);
  });

  it("does not call onRate when not interactive", () => {
    const onRate = vi.fn();
    const { container } = render(<StarRating value={0} interactive={false} onRate={onRate} />);
    const stars = container.querySelectorAll("span");
    fireEvent.click(stars[2]);
    expect(onRate).not.toHaveBeenCalled();
  });
});
