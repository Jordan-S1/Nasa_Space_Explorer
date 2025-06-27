import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Rocket, Camera, Globe, Zap } from "lucide-react";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Picture of the Day", href: "#apod", icon: Camera },
    { label: "Mars Rover Photos", href: "#mars", icon: Globe },
    { label: "Near Earth Objects", href: "#neo", icon: Zap },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card mx-4 mt-4 rounded-xl">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Rocket className="h-8 w-8 text-space-star animate-pulse-slow" />
            <a href="#hero">
              <span className="text-2xl font-bold text-glow cursor-pointer">
                NASA Explorer
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-2 text-foreground/80 hover:text-space-star transition-colors duration-300"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </a>
            ))}
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="transition-transform duration-200 hover:scale-110 hover:text-space-star cursor-pointer"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="bg-space-blue border-white/20"
            >
              <div className="flex flex-col space-y-4 mt-12">
                {navItems.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center space-x-3 text-foreground/80 hover:text-space-star transition-colors duration-300 py-2"
                  >
                    <item.icon className="h-5 w-5 ml-7" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
