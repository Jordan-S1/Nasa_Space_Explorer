import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest"; // Use this for better assertions
import APOD from "../APOD";
import { beforeEach, describe, expect, it, vi } from "vitest";
import axios from "axios";

// Mock dependencies
vi.mock("axios");
vi.mock("@/components/ui/button", () => ({
  Button: (props: any) => <button {...props} />,
}));
vi.mock("@/components/ui/spinner", () => ({
  Spinner: () => <span data-testid="spinner" />,
}));
vi.mock("@/components/ui/card", () => ({
  CardContent: (props: any) => <div {...props} />,
  CardDescription: (props: any) => <div {...props} />,
  CardHeader: (props: any) => <div {...props} />,
  CardTitle: (props: any) => <div {...props} />,
}));
vi.mock("lucide-react", () => ({
  Calendar: () => <span data-testid="calendar" />,
  ExternalLink: () => <span data-testid="external-link" />,
  Download: () => <span data-testid="download" />,
  Camera: () => <span data-testid="camera" />,
}));
vi.mock("sonner", () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock("@/lib/toastQueue", () => ({
  toastQueue: { enqueue: vi.fn((cb) => cb()) },
}));

const mockApodData = {
  date: "2024-06-01",
  title: "Test APOD Title",
  explanation: "Test explanation.",
  url: "https://example.com/image.jpg",
  hdurl: "https://example.com/hdimage.jpg",
  media_type: "image",
  copyright: "NASA",
};

describe("APOD component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    (axios.get as any).mockReturnValue(
      new Promise(() => {}) // never resolves
    );
    render(<APOD />);
    expect(screen.getByTestId("apod-loading")).toBeInTheDocument();
  });

  it("renders APOD data after fetch", async () => {
    vi.setSystemTime(new Date(mockApodData.date));
    (axios.get as any).mockResolvedValue({ data: mockApodData });
    render(<APOD />);
    expect(await screen.findByText(mockApodData.title)).toBeInTheDocument();
    expect(screen.getByText(/Test explanation/)).toBeInTheDocument();
    expect(screen.getByDisplayValue(mockApodData.date)).toBeInTheDocument();
    expect(screen.getByRole("img")).toHaveAttribute("src", mockApodData.url);
    expect(screen.getByText(/Download HD/)).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("handles date change and fetches new data", async () => {
    (axios.get as any).mockResolvedValueOnce({ data: mockApodData });
    render(<APOD />);
    expect(await screen.findByText(mockApodData.title)).toBeInTheDocument();
    const newDate = "2024-05-31";
    (axios.get as any).mockResolvedValueOnce({
      data: { ...mockApodData, date: newDate, title: "New Title" },
    });
    fireEvent.change(screen.getByDisplayValue(mockApodData.date), {
      target: { value: newDate },
    });
    expect(await screen.findByText("New Title")).toBeInTheDocument();
  });

  it("shows error toast on fetch failure", async () => {
    const { toast } = await import("sonner");
    (axios.get as any).mockRejectedValue({ message: "Network error" });
    render(<APOD />);
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "Failed to load Astronomy Picture of the Day",
        expect.objectContaining({ description: "Network error" })
      )
    );
  });

  it("disables download button while downloading", async () => {
    (axios.get as any).mockResolvedValue({ data: mockApodData });
    render(<APOD />);
    await screen.findByText(mockApodData.title);

    // Mock fetch for download
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["test"])),
    } as any);

    const downloadBtns = screen.getAllByText(/Download HD/);
    const downloadBtn = downloadBtns[0];
    fireEvent.click(downloadBtn);

    expect(downloadBtn).toBeDisabled();
    await waitFor(() => expect(downloadBtn).not.toBeDisabled());
  });

  it("renders video if media_type is video", async () => {
    (axios.get as any).mockResolvedValue({
      data: {
        ...mockApodData,
        media_type: "video",
        url: "https://example.com/video.mp4",
      },
    });
    render(<APOD />);
    expect(await screen.findByTitle(mockApodData.title)).toBeInTheDocument();
    expect(screen.getByTitle(mockApodData.title).tagName).toBe("IFRAME");
  });
});
