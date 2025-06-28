import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import MarsRover from "../MarsRover";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

// Mock dependencies
vi.mock("axios");
vi.mock("@/components/ui/card", () => ({
  Card: (props: any) => <div {...props} />,
  CardContent: (props: any) => <div {...props} />,
}));
vi.mock("@/components/ui/select", () => ({
  Select: (props: any) => <div {...props} />,
  SelectContent: (props: any) => <div {...props} />,
  SelectItem: (props: any) => <div {...props} />,
  SelectTrigger: (props: any) => <div {...props} />,
  SelectValue: (props: any) => <div {...props} />,
}));
vi.mock("@/components/ui/input", () => ({
  Input: (props: any) => <input {...props} />,
}));
vi.mock("@/components/ui/label", () => ({
  Label: (props: any) => <label {...props} />,
}));
vi.mock("@/components/ui/button", () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock("lucide-react", () => ({
  Globe: () => <span data-testid="globe" />,
  Camera: () => <span data-testid="camera" />,
  ExternalLink: () => <span data-testid="external-link" />,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/lib/toastQueue", () => ({
  toastQueue: { enqueue: vi.fn((cb) => cb()) },
}));

const mockPhotos = [
  {
    id: 1,
    img_src: "https://mars.nasa.gov/photo1.jpg",
    rover: { name: "Curiosity" },
    sol: 1000,
    camera: { full_name: "Front Hazard Avoidance Camera" },
    earth_date: "2021-01-01",
  },
];

describe("MarsRover component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    (axios.get as any).mockReturnValue(new Promise(() => {}));
    render(<MarsRover />);
    expect(screen.getByText(/Mars Rover Gallery/i)).toBeInTheDocument();
  });

  it("renders photos after fetch", async () => {
    (axios.get as any).mockResolvedValue({ data: { photos: mockPhotos } });
    render(<MarsRover />);
    // Find the card by alt text or another unique property
    const img = await screen.findByAltText(/Mars photo by Curiosity/);
    const card = img.closest(".bg-space-blue") as HTMLElement | null;
    expect(card).not.toBeNull();
    const utils = within(card!);
    expect(utils.getByText(/Curiosity/)).toBeInTheDocument();
    expect(utils.getByText(/Sol 1000/)).toBeInTheDocument();
    expect(
      utils.getByText(/Front Hazard Avoidance Camera/)
    ).toBeInTheDocument();
    expect(utils.getByText(/2021-01-01/)).toBeInTheDocument();
  });

  it("shows no photos found message", async () => {
    (axios.get as any).mockResolvedValue({ data: { photos: [] } });
    render(<MarsRover />);
    expect(await screen.findByText(/No photos found/i)).toBeInTheDocument();
  });

  it("shows error toast on fetch failure", async () => {
    const { toast } = await import("sonner");
    (axios.get as any).mockRejectedValue({ message: "Network error" });
    render(<MarsRover />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to load Mars Rover Photos",
        expect.objectContaining({ description: "Network error" })
      )
    );
  });

  it("paginates photos", async () => {
    // Create 37 photos to ensure pagination (25 + 12 = 37 total)
    const manyPhotos = Array.from({ length: 37 }, (_, i) => ({
      id: i + 1,
      img_src: `https://mars.nasa.gov/photo${i + 1}.jpg`,
      rover: { name: "Curiosity" },
      sol: 1000 + i,
      camera: { full_name: `Camera ${i + 1}` },
      earth_date: `2021-01-${String((i % 30) + 1).padStart(2, "0")}`,
    }));

    (axios.get as any).mockResolvedValue({ data: { photos: manyPhotos } });
    render(<MarsRover />);

    const headings = await screen.findAllByRole("heading", {
      name: /Mars Rover Gallery/i,
    });
    expect(headings.length).toBeGreaterThan(0);

    // Wait for first page to load (should be 25 images, not 26)
    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(26);
    });

    expect(screen.getByText(/Page 1 of/)).toBeInTheDocument();

    // Go to next page
    fireEvent.click(screen.getByRole("button", { name: /Next/i }));
    expect(await screen.findByText(/Page 2 of/)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByRole("img")).toHaveLength(13);
    });
  });
});
