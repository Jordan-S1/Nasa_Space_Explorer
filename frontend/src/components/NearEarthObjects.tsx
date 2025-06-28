import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Zap, AlertTriangle, Calendar, Ruler, Gauge } from "lucide-react";
import { toast } from "sonner";
import { toastQueue } from "@/lib/toastQueue";
import { Button } from "@/components/ui/button";

// Base URL for the backend API
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Define the structure of a Near Earth Object
interface NearEarthObject {
  id: string;
  name: string;
  is_potentially_hazardous_asteroid: boolean;
  absolute_magnitude_h: number;
  estimated_diameter: {
    kilometers: {
      estimated_diameter_min: number;
      estimated_diameter_max: number;
    };
  };
  close_approach_data: {
    close_approach_date: string;
    miss_distance: {
      kilometers: string;
    };
    relative_velocity: {
      kilometers_per_hour: string;
    };
  }[];
}

const NearEarthObjects = () => {
  const [neoData, setNeoData] = useState<NearEarthObject[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + 7);
  const errorToastShown = useRef(false);

  const startDateStr = today.toISOString().split("T")[0];
  const endDateStr = endDate.toISOString().split("T")[0];

  const [currentPage, setCurrentPage] = useState(1);
  const objectsPerPage = 12;

  // Calculate total pages based on the number of objects and objects per page
  const totalPages = Math.ceil(neoData.length / objectsPerPage);
  const paginatedObjects = useMemo(() => {
    const start = (currentPage - 1) * objectsPerPage;
    return neoData.slice(start, start + objectsPerPage);
  }, [neoData, currentPage]);

  // Fetch Near Earth Objects data from the Backend API
  useEffect(() => {
    const fetchNEO = async () => {
      setIsLoading(true);
      errorToastShown.current = false;
      try {
        const response = await axios.get(`${API_BASE_URL}/api/nasa/neo`, {
          params: {
            start_date: startDateStr,
            end_date: endDateStr,
          },
        });
        const objects: NearEarthObject[] = [];

        // Flatten and sort data by distance
        Object.values(response.data.near_earth_objects || {}).forEach(
          (day: any) => {
            objects.push(...day);
          }
        );
        // Sort objects by closest approach distance
        objects.sort((a, b) => {
          const aDist = parseFloat(
            a.close_approach_data[0]?.miss_distance.kilometers || "0"
          );
          const bDist = parseFloat(
            b.close_approach_data[0]?.miss_distance.kilometers || "0"
          );
          return aDist - bDist;
        });
        setNeoData(objects);
      } catch (err: any) {
        // Log the error and show a toast notification
        console.error("Fetch error:", err);
        if (!errorToastShown.current) {
          toastQueue.enqueue(() =>
            toast.error("Failed to load Near Earth Objects", {
              description:
                err?.response?.data?.message ||
                err.message ||
                "An unexpected error occurred.",
            })
          );
          errorToastShown.current = true;
        }
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch NEO data when component mounts or date range changes
    fetchNEO();
  }, [startDateStr, endDateStr]);

  // Memoize to avoid unnecessary recalculations
  // Calculate statistics for the NEO data
  const stats = useMemo(() => {
    const hazardous = neoData.filter(
      (obj) => obj.is_potentially_hazardous_asteroid
    ).length;
    const totalObjects = neoData.length;
    const avgSize =
      neoData.reduce((sum, obj) => {
        const avgDiameter =
          (obj.estimated_diameter.kilometers.estimated_diameter_min +
            obj.estimated_diameter.kilometers.estimated_diameter_max) /
          2;
        return sum + avgDiameter;
      }, 0) / totalObjects;

    return {
      total: totalObjects,
      hazardous,
      safe: totalObjects - hazardous,
      avgSize: avgSize || 0,
    };
  }, [neoData]);

  // Function to format distance in km or M km
  const formatDistance = (km: string) => {
    const dist = parseFloat(km);
    return dist > 1000000
      ? `${(dist / 1000000).toFixed(2)}M km`
      : `${dist.toLocaleString()} km`;
  };

  // Function to format velocity in km/h
  const formatVelocity = (kmh: string) => {
    return `${parseFloat(kmh).toLocaleString()} km/h`;
  };

  // Function to determine danger level based on distance and size
  const getDangerLevel = (obj: NearEarthObject) => {
    const dist = parseFloat(
      obj.close_approach_data[0]?.miss_distance.kilometers || "0"
    );
    const size =
      (obj.estimated_diameter.kilometers.estimated_diameter_min +
        obj.estimated_diameter.kilometers.estimated_diameter_max) /
      2;

    if (obj.is_potentially_hazardous_asteroid) return "high";
    if (dist < 1000000 && size > 0.1) return "medium";
    return "low";
  };

  // Render the Near Earth Objects section
  return (
    <section
      id="neo"
      className="min-h-screen py-20 px-4 bg-gradient-to-b from-transparent to-space-nebula/20"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Zap className="h-8 w-8 text-yellow-500 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-glow">
              Near Earth Objects
            </h2>
          </div>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Track asteroids and comets approaching Earth in the next 7 days
          </p>
        </div>

        {/* Statistics Cards */}
        {/* Total Objects Card */}
        {!isLoading && neoData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-space-blue">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                  <Zap className="h-7 w-7 text-blue-400 mr-2" />
                  Total Objects
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-blue-400 text-center">
                  {stats.total}
                </div>
              </CardContent>
            </Card>

            {/* Hazardous Card */}
            <Card className="bg-space-blue">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-red-400 mr-2" />
                  Hazardous
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-red-400 text-center">
                  {stats.hazardous}
                </div>
                <Progress
                  value={(stats.hazardous / stats.total) * 100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            {/* Safe Card */}
            <Card className="bg-space-blue">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                  <Gauge className="h-7 w-7 text-green-400 mr-2" />
                  Safe
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-green-400 text-center">
                  {stats.safe}
                </div>
                <Progress
                  value={(stats.safe / stats.total) * 100}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            {/* Average Size Card */}
            <Card className="bg-space-blue">
              <CardHeader>
                <CardTitle className="text-2xl flex items-center justify-center">
                  <Ruler className="h-7 w-7 text-purple-400 mr-2" />
                  Avg Size
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-5xl font-bold text-purple-400 text-center">
                  {stats.avgSize.toFixed(2)} km
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-white/20 rounded w-3/4" />
                  <div className="space-y-2">
                    <div className="h-4 bg-white/20 rounded" />
                    <div className="h-4 bg-white/20 rounded w-5/6" />
                    <div className="h-4 bg-white/20 rounded w-4/6" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!isLoading && neoData.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedObjects.map((obj) => {
                // Determine danger level and format data
                const dangerLevel = getDangerLevel(obj);
                // Get the first close approach data
                const approach = obj.close_approach_data[0];
                // Calculate average size
                const avgSize =
                  (obj.estimated_diameter.kilometers.estimated_diameter_min +
                    obj.estimated_diameter.kilometers.estimated_diameter_max) /
                  2;

                // Render the card for each Near Earth Object
                return (
                  <Card
                    key={obj.id}
                    className="bg-space-purple hover:scale-105 transition-transform duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg leading-tight">
                          {obj.name}
                        </CardTitle>
                        <div className="flex flex-col gap-2">
                          {obj.is_potentially_hazardous_asteroid && (
                            <Badge variant="destructive" className="text-sm">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Hazardous
                            </Badge>
                          )}
                          <Badge
                            variant={
                              dangerLevel === "high"
                                ? "destructive"
                                : dangerLevel === "medium"
                                ? "secondary"
                                : "outline"
                            }
                            className="text-sm"
                          >
                            {dangerLevel.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-foreground/60">Diameter</div>
                          <div className="font-semibold">
                            {avgSize.toFixed(3)} km
                          </div>
                        </div>
                        <div>
                          <div className="text-foreground/60">Magnitude</div>
                          <div className="font-semibold">
                            {obj.absolute_magnitude_h.toFixed(1)}
                          </div>
                        </div>
                      </div>

                      {approach && (
                        <div className="space-y-3">
                          <div className="flex items-center text-sm text-foreground/80">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(
                              approach.close_approach_date
                            ).toLocaleDateString()}
                          </div>

                          <div className="space-y-2">
                            <div>
                              <div className="text-xs text-foreground/60">
                                Miss Distance
                              </div>
                              <div className="text-sm font-medium">
                                {formatDistance(
                                  approach.miss_distance.kilometers
                                )}
                              </div>
                            </div>

                            <div>
                              <div className="text-xs text-foreground/60">
                                Velocity
                              </div>
                              <div className="text-sm font-medium">
                                {formatVelocity(
                                  approach.relative_velocity.kilometers_per_hour
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}

        {/* No Results */}
        {!isLoading && neoData.length === 0 && (
          <div className="text-center py-12">
            <Zap className="h-16 w-16 text-yellow-500/50 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No objects detected</h3>
            <p className="text-foreground/60">
              No near Earth objects found for the next 7 days
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default NearEarthObjects;
