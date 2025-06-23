import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
const Index = () => {
  return (
    <div className="min-h-screen bg-cosmic-gradient">
      <Navigation />
      <Hero />
      {/* Footer */}
      <footer className="border-t border-white/10 bg-space-blue/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p className="text-foreground/60">
              Built with NASA's Open APIs • Data courtesy of NASA
            </p>
            <p className="text-sm text-foreground/40 mt-2">
              Explore the universe through science and discovery
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
