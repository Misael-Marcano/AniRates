import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "@/components/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Guardar</Button>);
    expect(screen.getByRole("button", { name: "Guardar" })).toBeInTheDocument();
  });

  it("calls onClick", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("applies primary variant by default", () => {
    render(<Button>X</Button>);
    const btn = screen.getByRole("button");
    expect(btn.style.backgroundColor).toBe("rgb(245, 197, 24)");
  });

  it("applies danger variant", () => {
    render(<Button variant="danger">Eliminar</Button>);
    const btn = screen.getByRole("button");
    expect(btn.style.backgroundColor).toBe("rgb(229, 62, 62)");
  });

  it("forwards disabled prop", () => {
    render(<Button disabled>X</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
