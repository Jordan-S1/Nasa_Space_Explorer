import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar, ExternalLink, Download, Camera } from "lucide-react";
import { toast } from "sonner";
import { toastQueue } from "@/lib/toastQueue";
// Define the structure of the APOD data
interface APODData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: "image" | "video";
  copyright?: string;
}
// Base URL for the backend API
const API_BASE_URL = "https://nasa-space-explorer-backend-six.vercel.app/";
const APOD = () => {
  // State to manage selected date and APOD data
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [apodData, setApodData] = useState<APODData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [downloading, setDownloading] = useState(false);
  const errorToastShown = useRef(false);

  // Function to fetch APOD data from the backend
  const fetchAPOD = async (date: string) => {
    try {
      setLoading(true);
      errorToastShown.current = false; // Reset before fetch
      const response = await axios.get(`${API_BASE_URL}/api/nasa/apod`, {
        params: { date },
      });
      setApodData(response.data); // Set the fetched APOD data
    } catch (error: any) {
      // Log the error and show a toast notification
      console.error("Fetch error:", error);
      if (!errorToastShown.current) {
        toastQueue.enqueue(() =>
          toast.error("Failed to load Astronomy Picture of the Day", {
            description:
              error?.response?.data?.message ||
              error.message ||
              "An unexpected error occurred.",
          })
        );
        // Set the flag to prevent duplicate toasts
        errorToastShown.current = true;
      }
    } finally {
      setLoading(false);
    }
  };
  // Fetch APOD data when the component mounts or when selectedDate changes
  useEffect(() => {
    fetchAPOD(selectedDate);
  }, [selectedDate]);
  // Handle date change from the date picker
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
  };
  // Function to download the image
  const downloadImage = async () => {
    if (!apodData?.hdurl && !apodData?.url) return;
    setDownloading(true);
    try {
      const imageUrl = apodData.hdurl || apodData.url;
      const response = await fetch(
        `${API_BASE_URL}/api/nasa/download-image?imageUrl=${encodeURIComponent(
          imageUrl
        )}`
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `nasa-apod-${selectedDate}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Download Successful!");
    } catch (error) {
      toast.error("Failed to download the image. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
  // Show loading state while fetching data
  if (loading) {
    return (
      <section
        id="apod"
        className="min-h-screen flex items-center justify-center px-4"
        data-testid="apod-loading"
      >
        <div className="glass-card p-8 rounded-xl animate-pulse space-y-4">
          <div className="h-8 bg-white/20 rounded w-3/4 mx-auto" />
          <div className="h-64 bg-white/20 rounded" />
          <div className="space-y-2">
            <div className="h-4 bg-white/20 rounded" />
            <div className="h-4 bg-white/20 rounded w-5/6" />
            <div className="h-4 bg-white/20 rounded w-4/6" />
          </div>
        </div>
      </section>
    );
  }
  // Render the APOD data
  return (
    <section id="apod" className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-space-star mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-glow">
              Astronomy Picture of the Day
            </h2>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Discover the cosmos through NASA's daily featured image with
            detailed explanations
          </p>
        </div>
        {/*Card to display APOD data*/}
        <div className="glass-card rounded-xl overflow-hidden">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 py-5">
              <div>
                <CardTitle className="text-2xl md:text-3xl text-glow">
                  {apodData?.title}
                </CardTitle>
                <CardDescription className="text-foreground/60 mt-2">
                  {apodData?.date &&
                    new Date(apodData.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  {apodData?.copyright && (
                    <span className="ml-2">© {apodData.copyright}</span>
                  )}
                </CardDescription>
              </div>
              {/*Date picker and download button*/}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-6 w-6 text-space-star" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={handleDateChange}
                    max={new Date().toISOString().split("T")[0]}
                    min="1995-06-16"
                    className="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-space-star h-10"
                  />
                </div>

                {apodData?.media_type === "image" && (
                  <Button
                    onClick={downloadImage}
                    variant="outline"
                    size="sm"
                    className="border-white/20 bg-black/70 hover:bg-white/10 cursor-pointer h-10"
                    disabled={downloading}
                  >
                    {downloading ? (
                      <Spinner className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5 mr-2" />
                    )}
                    {downloading ? "Downloading..." : "Download HD"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {apodData?.media_type === "image" ? (
              <div className="relative group">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
                {apodData.hdurl && (
                  <a
                    href={apodData.hdurl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ExternalLink className="h-5 w-5 text-white" />
                  </a>
                )}
              </div>
            ) : apodData?.media_type === "video" ? (
              <div className="aspect-video">
                <iframe
                  src={apodData.url}
                  title={apodData.title}
                  className="w-full h-full"
                  allowFullScreen
                />
              </div>
            ) : null}

            <div className="p-6">
              <p className="text-foreground/90 leading-relaxed text-lg">
                {apodData?.explanation}
              </p>
            </div>
          </CardContent>
        </div>
      </div>
    </section>
  );
};

export default APOD;
