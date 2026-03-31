import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image, Zap, Shield, Menu, X, Archive, Crop, RotateCcw, Maximize2, Mail, Info } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { name: "Compress", href: "/compress", icon: Archive },
  { name: "Resize", href: "/resize", icon: Maximize2 },
  { name: "Crop", href: "/crop", icon: Crop },
  { name: "Convert", href: "/convert", icon: RotateCcw },
  { name: "About", href: "/about", icon: Info },
  { name: "Contact", href: "/contact", icon: Mail },
];

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-lg border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-gradient-primary p-2 rounded-xl shadow-sm group-hover:shadow-md transition-shadow">
                <Image className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">ImageTools</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(item.href)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-border/50 animate-fade-in">
              <nav className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive(item.href)
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-card/50 backdrop-blur-sm border-t border-border/50">
        <div className="container mx-auto px-4 py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-gradient-primary p-1.5 rounded-lg">
                  <Image className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-bold">ImageTools</span>
              </Link>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast, free, and privacy-focused image processing tools that work in your browser.
              </p>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Tools</h3>
              <ul className="space-y-2">
                {navItems.slice(0, 4).map((item) => (
                  <li key={item.name}>
                    <Link to={item.href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <item.icon className="h-3.5 w-3.5" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Info className="h-3.5 w-3.5" />About Us</Link></li>
                <li><Link to="/contact" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"><Mail className="h-3.5 w-3.5" />Contact</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3 text-sm uppercase tracking-wider text-muted-foreground">Why Us</h3>
              <ul className="space-y-2.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-primary" />
                  Instant Processing
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5 text-primary" />
                  100% Private
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 mt-8 pt-6 text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} ImageTools. All rights reserved. Images are processed locally and never uploaded.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
