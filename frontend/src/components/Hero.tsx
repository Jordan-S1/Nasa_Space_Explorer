import { ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const scrollToContent = () => {
    document.getElementById("apod")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background stars */}
      <div className="stars">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="star"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>
      {/* Hero content */}
      <div className="text-center z-10 px-4">
        <h1 className="text-6xl md:text-8xl font-bold mb-6 text-glow bg-gradient-to-r from-white via-blue-200 to-purple-300 bg-clip-text text-transparent animate-float">
          NASA
        </h1>
        <p className="text-2xl md:text-4xl mb-4 font-light">Space Explorer</p>
        <p className="text-lg md:text-xl mb-8 text-foreground/80 max-w-2xl mx-auto">
          Discover the wonders of the universe through NASA's incredible data
          and imagery
        </p>

        <Button onClick={scrollToContent} className="cosmic-button group">
          Explore the Universe
          <ArrowDown className="ml-2 h-4 w-4 group-hover:translate-y-1 transition-transform" />
        </Button>
      </div>

      {/* Floating elements */}
      <div className="absolute top-30 left-10 w-4 h-4 bg-space-star rounded-full animate-float opacity-60" />
      <div
        className="absolute top-40 right-20 w-2 h-2 bg-blue-400 rounded-full animate-float opacity-80"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute bottom-40 left-1/4 w-3 h-3 bg-purple-400 rounded-full animate-float opacity-70"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-20 right-1/4 w-5 h-5 bg-red-700 rounded-full animate-float opacity-50"
        style={{ animationDelay: "1s" }}
      />
    </section>
  );
};

export default Hero;
// This code defines a Hero component that displays a hero section with animated stars, a title, a subtitle, and a button to scroll to the content section.
// The background stars are created using CSS animations, and the button has an arrow icon that animates on hover.
