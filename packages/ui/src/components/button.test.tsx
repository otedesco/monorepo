import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
  });

  it("renders with variant prop", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    let button = screen.getByRole("button", { name: /default/i });
    expect(button).toHaveClass("bg-brand-primary");

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole("button", { name: /outline/i });
    expect(button).toHaveClass("border-border-strong");

    rerender(<Button variant="ghost">Ghost</Button>);
    button = screen.getByRole("button", { name: /ghost/i });
    expect(button).toHaveClass("hover:bg-surface");

    rerender(<Button variant="muted">Muted</Button>);
    button = screen.getByRole("button", { name: /muted/i });
    expect(button).toHaveClass("bg-brand-muted");
  });

  it("renders with size prop", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    let button = screen.getByRole("button", { name: /small/i });
    expect(button).toHaveClass("h-8");

    rerender(<Button size="md">Medium</Button>);
    button = screen.getByRole("button", { name: /medium/i });
    expect(button).toHaveClass("h-10");

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole("button", { name: /large/i });
    expect(button).toHaveClass("h-12");
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole("button", { name: /click me/i });
    await user.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("does not call onClick when disabled", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled
      </Button>
    );

    const button = screen.getByRole("button", { name: /disabled/i });
    await user.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it("forwards ref correctly", () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Button</Button>);
    expect(ref).toHaveBeenCalled();
  });

  it("applies custom className", () => {
    render(<Button className="custom-class">Button</Button>);
    const button = screen.getByRole("button", { name: /button/i });
    expect(button).toHaveClass("custom-class");
  });

  it("renders with all variants and sizes", () => {
    render(
      <div>
        <Button variant="default" size="sm">
          Default Small
        </Button>
        <Button variant="outline" size="md">
          Outline Medium
        </Button>
        <Button variant="ghost" size="lg">
          Ghost Large
        </Button>
        <Button variant="muted" size="md">
          Muted Medium
        </Button>
      </div>
    );

    expect(screen.getByRole("button", { name: /default small/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /outline medium/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ghost large/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /muted medium/i })).toBeInTheDocument();
  });
});

