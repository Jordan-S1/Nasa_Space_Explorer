import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import NearEarthObjects from "../NearEarthObjects";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

// Mock dependencies
vi.mock("axios");
vi.mock("@/components/ui/card", () => ({
  Card: (props: any) => <div {...props} />,
  CardContent: (props: any) => <div {...props} />,
  CardHeader: (props: any) => <div {...props} />,
  CardTitle: (props: any) => <div {...props} />,
}));
vi.mock("@/components/ui/badge", () => ({
  Badge: (props: any) => <span {...props} />,
}));
vi.mock("@/components/ui/progress", () => ({
  Progress: (props: any) => <div data-testid="progress" {...props} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock("lucide-react", () => ({
  Zap: () => <span data-testid="zap" />,
  AlertTriangle: () => <span data-testid="alert-triangle" />,
  Calendar: () => <span data-testid="calendar" />,
  Ruler: () => <span data-testid="ruler" />,
  Gauge: () => <span data-testid="gauge" />,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/lib/toastQueue", () => ({
  toastQueue: { enqueue: vi.fn((cb) => cb()) },
}));

const mockNEO = [
  {
    id: "1",
    name: "Asteroid 2024 AB",
    is_potentially_hazardous_asteroid: true,
    absolute_magnitude_h: 22.1,
    estimated_diameter: {
      kilometers: {
        estimated_diameter_min: 0.1,
        estimated_diameter_max: 0.2,
      },
    },
    close_approach_data: [
      {
        close_approach_date: "2024-07-01",
        miss_distance: { kilometers: "500000" },
        relative_velocity: { kilometers_per_hour: "12345" },
      },
    ],
  },
];

describe("NearEarthObjects component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    (axios.get as any).mockReturnValue(new Promise(() => {}));
    render(<NearEarthObjects />);
    expect(screen.getByText(/Near Earth Objects/i)).toBeInTheDocument();
  });

  it("renders NEO cards after fetch", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        near_earth_objects: {
          "2024-07-01": mockNEO,
        },
      },
    });
    render(<NearEarthObjects />);
    expect(await screen.findByText(/Asteroid 2024 AB/)).toBeInTheDocument();
    const hazardousEls = screen.getAllByText(/Hazardous/i);
    // The badge in the card is a <span> with class "text-sm"
    const badge = hazardousEls.find(
      (el) => el.tagName === "SPAN" && el.className.includes("text-sm")
    );
    expect(badge).toBeInTheDocument();
    expect(screen.getByText(/HIGH/i)).toBeInTheDocument();
    expect(screen.getByText(/0.15 km/)).toBeInTheDocument(); // avg size
    expect(screen.getByText(/22.1/)).toBeInTheDocument(); // magnitude
    expect(screen.getByText(/500,000 km/)).toBeInTheDocument(); // miss distance
    expect(screen.getByText(/12,345 km\/h/)).toBeInTheDocument(); // velocity
  });

  it("shows no objects detected message", async () => {
    (axios.get as any).mockResolvedValue({
      data: { near_earth_objects: {} },
    });
    render(<NearEarthObjects />);
    expect(await screen.findByText(/No objects detected/i)).toBeInTheDocument();
  });

  it("shows error toast on fetch failure", async () => {
    const { toast } = await import("sonner");
    (axios.get as any).mockRejectedValue({ message: "Network error" });
    render(<NearEarthObjects />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to load Near Earth Objects",
        expect.objectContaining({ description: "Network error" })
      )
    );
  });

  it("paginates NEO cards", async () => {
    // Create 13 mock objects to trigger pagination (objectsPerPage = 12)
    const manyNEOs = Array.from({ length: 13 }, (_, i) => ({
      ...mockNEO[0],
      id: String(i + 1),
      name: `Asteroid ${i + 1}`,
    }));
    (axios.get as any).mockResolvedValue({
      data: { near_earth_objects: { "2024-07-01": manyNEOs } },
    });
    render(<NearEarthObjects />);
    expect(await screen.findByText(/^Asteroid 1$/)).toBeInTheDocument();
    // Should only show 12 on first page
    expect(screen.queryByText(/Asteroid 13/)).not.toBeInTheDocument();
    // Go to next page
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(await screen.findByText(/Asteroid 13/)).toBeInTheDocument();
  });
});
