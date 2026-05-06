import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "vitest-axe";
import Avatar from "@/components/Avatar";
import Badge from "@/components/Badge";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import RatingHistogram from "@/components/RatingHistogram";

describe("a11y — components", () => {
  it("Avatar (initials) has no a11y violations", async () => {
    const { container } = render(<Avatar name="Misael" userId={1} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Badge has no a11y violations", async () => {
    const { container } = render(<Badge type="ANIME" label="ANIME" />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("Button has no a11y violations", async () => {
    const { container } = render(<Button>Guardar</Button>);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("StarRating has no a11y violations", async () => {
    const { container } = render(<StarRating value={7} />);
    expect(await axe(container)).toHaveNoViolations();
  });

  it("RatingHistogram has no a11y violations", async () => {
    const { container } = render(<RatingHistogram distribution={[1, 2, 3, 4, 5, 4, 3, 2, 1, 0]} avg={5.5} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
