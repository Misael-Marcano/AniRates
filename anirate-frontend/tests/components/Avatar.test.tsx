import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Avatar from "@/components/Avatar";

describe("Avatar", () => {
  it("renders initials from name when no image", () => {
    render(<Avatar name="Misael" />);
    expect(screen.getByText("MI")).toBeInTheDocument();
  });

  it("renders only first 2 chars uppercase", () => {
    render(<Avatar name="anonimo" />);
    expect(screen.getByText("AN")).toBeInTheDocument();
  });

  it("renders img when imageUrl provided", () => {
    render(<Avatar name="Test" imageUrl="https://example.com/a.jpg" />);
    const img = screen.getByRole("img", { name: "Test" });
    expect(img).toHaveAttribute("src", "https://example.com/a.jpg");
  });

  it("uses deterministic palette by userId", () => {
    const { container: c1 } = render(<Avatar name="A" userId={1} />);
    const { container: c2 } = render(<Avatar name="B" userId={1} />);
    const div1 = c1.querySelector("div");
    const div2 = c2.querySelector("div");
    expect(div1?.style.backgroundColor).toBe(div2?.style.backgroundColor);
  });
});
