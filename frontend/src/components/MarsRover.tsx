import { useEffect, useState, useMemo, useRef } from "react";
import axios from "axios";
import { toast } from "sonner";
import { toastQueue } from "@/lib/toastQueue";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Globe, Camera, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

// backend API base URL
const API_BASE_URL = "https://nasa-space-explorer-backend-six.vercel.app/";

const MarsRover = () => {
  const [rover, setRover] = useState("curiosity");
  const [sol, setSol] = useState(1000);
  const [camera, setCamera] = useState("all");
  const [earthDate, setEarthDate] = useState(""); // Format: YYYY-MM-DD
  const [searchMode, setSearchMode] = useState<"sol" | "earth_date">("sol");
  const [marsPhotos, setMarsPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const photosPerPage = 25; // Number of photos per page
  const errorToastShown = useRef(false);

  // Rover options
  const rovers = [
    { value: "curiosity", label: "Curiosity" },
    { value: "opportunity", label: "Opportunity" },
    { value: "spirit", label: "Spirit" },
  ];
  // Camera options for Mars rovers
  const cameras = [
    { value: "all", label: "All Cameras" },
    { value: "fhaz", label: "Front Hazard Avoidance Camera" },
    { value: "rhaz", label: "Rear Hazard Avoidance Camera" },
    { value: "mast", label: "Mast Camera" },
    { value: "chemcam", label: "Chemistry and Camera Complex" },
    { value: "mahli", label: "Mars Hand Lens Imager" },
    { value: "mardi", label: "Mars Descent Imager" },
    { value: "navcam", label: "Navigation Camera" },
    { value: "pancam", label: "Panoramic Camera" },
    { value: "minites", label: "Miniature Thermal Emission Spectrometer" },
  ];

  // Effect to fetch Mars rover photos based on selected parameters
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      errorToastShown.current = false;
      try {
        const params: Record<string, string | number> = {};

        if (searchMode === "sol") {
          params.sol = sol;
        } else if (searchMode === "earth_date" && earthDate) {
          params.earth_date = earthDate;
        }

        if (camera !== "all") {
          params.camera = camera;
        }

        const { data } = await axios.get(
          `${API_BASE_URL}/api/nasa/mars/${rover}/photos`,
          {
            params,
          }
        );
        setMarsPhotos(data.photos || []);
      } catch (err: any) {
        // Log the error and show a toast notification
        console.error("Fetch error:", err);
        if (!errorToastShown.current) {
          toastQueue.enqueue(() =>
            toast.error("Failed to load Mars Rover Photos", {
              description:
                err?.response?.data?.message ||
                err.message ||
                "An unexpected error occurred.",
            })
          );
          // Set the flag to prevent duplicate toasts
          errorToastShown.current = true;
        }
        setMarsPhotos([]);
      } finally {
        setLoading(false);
      }
    };
    // Validate inputs before fetching
    if (searchMode === "earth_date" && !earthDate) return;
    fetchPhotos();
  }, [rover, sol, earthDate, camera, searchMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [rover, sol, earthDate, camera, searchMode]);

  const totalPages = Math.ceil(marsPhotos.length / photosPerPage);
  const paginatedPhotos = useMemo(() => {
    const start = (currentPage - 1) * photosPerPage;
    return marsPhotos.slice(start, start + photosPerPage);
  }, [marsPhotos, currentPage]);

  // Render the Mars Rover Gallery component
  return (
    <section
      id="mars"
      className="min-h-screen py-20 px-4 bg-gradient-to-b from-transparent to-space-purple/20"
    >
      {/* Header */}
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-orange-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-glow">
              Mars Rover Gallery
            </h2>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Explore the Red Planet through the eyes of NASA's Mars rovers
          </p>
        </div>

        {/* Controls */}
        <div className="glass-card rounded-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
            <div className="flex flex-col items-center">
              <Label htmlFor="rover">Rover</Label>
              <Select value={rover} onValueChange={setRover}>
                <SelectTrigger className="min-w-[180px] max-w-[220px] mt-1 bg-white/10 border-white/20 cursor-pointer hover:bg-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-space-cosmic border-white/20">
                  {rovers.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col items-center">
              <Label htmlFor="searchMode">Search Mode</Label>
              <Select
                value={searchMode}
                onValueChange={(value) =>
                  setSearchMode(value as "sol" | "earth_date")
                }
              >
                <SelectTrigger className="min-w-[180px] max-w-[220px] mt-1 bg-white/10 border-white/20 cursor-pointer hover:bg-white/30">
                  <SelectValue placeholder="Search Mode" />
                </SelectTrigger>
                <SelectContent className="bg-space-cosmic border-white/20">
                  <SelectItem value="sol">Sol</SelectItem>
                  <SelectItem value="earth_date">Earth Date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {searchMode === "sol" ? (
              <div className="flex flex-col items-center">
                <Label htmlFor="sol">Sol (Martian Day)</Label>
                <Input
                  id="sol"
                  type="number"
                  value={sol}
                  onChange={(e) => setSol(Number(e.target.value))}
                  min={0}
                  max={3000}
                  className="min-w-[180px] max-w-[220px] mt-1 bg-white/10 border-white/20 cursor-pointer hover:bg-white/30"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Label htmlFor="earthDate">Earth Date</Label>
                <Input
                  id="earthDate"
                  type="date"
                  value={earthDate}
                  onChange={(e) => setEarthDate(e.target.value)}
                  className="w-fit mt-1 bg-white/10 border-white/20 hover:bg-white/30 px-5"
                />
              </div>
            )}

            <div className="flex flex-col items-center">
              <Label htmlFor="camera">Camera</Label>
              <Select value={camera} onValueChange={setCamera}>
                <SelectTrigger className="min-w-[180px] max-w-[220px] mt-1 bg-white/10 border-white/20 cursor-pointer hover:bg-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-space-cosmic border-white/20">
                  {cameras.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden">
                <div className="animate-pulse">
                  <div className="h-64 bg-white/20" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-white/20 rounded w-3/4" />
                    <div className="h-4 bg-white/20 rounded w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Photos Grid */}
        {!loading && marsPhotos.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginatedPhotos.map((photo: any) => (
              <Card
                key={photo.id}
                className="bg-space-blue overflow-hidden group hover:scale-105 transition-transform duration-300"
              >
                <div className="relative">
                  <img
                    src={photo.img_src}
                    alt={`Mars photo by ${photo.rover.name}`}
                    className="w-full h-48 object-cover"
                    loading="lazy"
                  />
                  <a
                    href={photo.img_src}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  >
                    <ExternalLink className="h-4 w-4 text-white" />
                  </a>
                </div>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-orange-400">
                        {photo.rover.name}
                      </span>
                      <span className="text-xs text-foreground/60">
                        Sol {photo.sol}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-foreground/80">
                      <Camera className="h-3 w-3 mr-1" />
                      {photo.camera.full_name}
                    </div>
                    <div className="text-xs text-foreground/60">
                      {photo.earth_date}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!loading && marsPhotos.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-orange-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No photos found</h3>
            <p className="text-foreground/60">
              Try adjusting the sol or earth date or camera selection
            </p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 gap-4">
            <Button
              className="cosmic-button group disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="self-center text-lg">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              className="cosmic-button group disabled:opacity-50"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default MarsRover;
