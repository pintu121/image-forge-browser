import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Image, Zap, Shield, Menu, X } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: "Compress", href: "/compress" },
    { name: "Resize", href: "/resize" },
    { name: "Crop", href: "/crop" },
    { name: "Convert", href: "/convert" },
    { name: "About", href: "/about" },
    { name: "Contact", href: "/contact" },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-primary p-2 rounded-lg">
                <Image className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ImageTools</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive(item.href) ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t">
              <nav className="flex flex-col space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 text-sm font-medium transition-colors hover:text-primary ${
                      isActive(item.href) ? "text-primary bg-primary/10" : "text-muted-foreground"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t mt-auto">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-primary p-2 rounded-lg">
                  <Image className="h-5 w-5 text-white" />
                </div>
                <span className="text-lg font-bold">ImageTools</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Fast, free, and privacy-focused image processing tools.
              </p>
            </div>

            {/* Tools */}
            <div>
              <h3 className="font-semibold mb-3">Tools</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/compress" className="text-muted-foreground hover:text-primary">Image Compressor</Link></li>
                <li><Link to="/resize" className="text-muted-foreground hover:text-primary">Image Resizer</Link></li>
                <li><Link to="/crop" className="text-muted-foreground hover:text-primary">Image Cropper</Link></li>
                <li><Link to="/convert" className="text-muted-foreground hover:text-primary">Format Converter</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
              </ul>
            </div>

            {/* Features */}
            <div>
              <h3 className="font-semibold mb-3">Features</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Fast Processing
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Privacy First
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 ImageTools. All rights reserved. Your images are processed locally and never uploaded to our servers.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};