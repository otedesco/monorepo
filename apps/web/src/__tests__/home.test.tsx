import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Home from "../app/page";

describe("Home Page", () => {
  it("renders the welcome heading", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /welcome to the web app/i })).toBeInTheDocument();
  });

  it("renders button variants section", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /button variants/i })).toBeInTheDocument();
  });

  it("renders all button variants", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /default/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /outline/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ghost/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /muted/i })).toBeInTheDocument();
  });

  it("renders button sizes section", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { name: /button sizes/i })).toBeInTheDocument();
  });

  it("renders all button sizes", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /small/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /medium/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /large/i })).toBeInTheDocument();
  });

  it("renders primary action button", () => {
    render(<Home />);
    expect(screen.getByRole("button", { name: /primary action/i })).toBeInTheDocument();
  });
});

