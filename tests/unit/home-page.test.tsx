import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { HomePage } from "../../components/home-page";


describe("HomePage", () => {
  it("renders the starter content and configured API URL", () => {
    render(<HomePage apiUrl="http://localhost:8000/api/v1" />);

    expect(
      screen.getByRole("heading", { name: "FastAPI + Next.js + Postgres" })
    ).toBeInTheDocument();
    expect(screen.getByText("Starter boilerplate")).toBeInTheDocument();
    expect(screen.getByText("Configured API base URL:")).toBeInTheDocument();
    expect(screen.getByText("http://localhost:8000/api/v1")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Getting started" })).toBeInTheDocument();
  });
});
