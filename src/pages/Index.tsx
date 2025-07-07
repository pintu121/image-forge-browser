import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Zap, Shield, Smartphone, Star, Archive, Crop, Image as ImageIcon, RotateCcw } from "lucide-react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const tools = [
    {
      title: "Image Compressor",
      description: "Reduce file size while maintaining quality. Perfect for web optimization.",
      icon: Archive,
      href: "/compress",
      color: "text-blue-600",
    },
    {
      title: "Image Resizer", 
      description: "Resize images to custom dimensions or by percentage with aspect ratio control.",
      icon: ImageIcon,
      href: "/resize",
      color: "text-green-600",
    },
    {
      title: "Image Cropper",
      description: "Crop images with precision using preset ratios or freeform selection.",
      icon: Crop,
      href: "/crop", 
      color: "text-purple-600",
    },
    {
      title: "Format Converter",
      description: "Convert between JPG, PNG, WEBP, BMP, GIF, and HEIC formats instantly.",
      icon: RotateCcw,
      href: "/convert",
      color: "text-orange-600",
    },
  ];

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Process images instantly with no waiting. All operations happen in your browser."
    },
    {
      icon: Shield,
      title: "100% Private",
      description: "Your images never leave your device. Everything is processed client-side for maximum privacy."
    },
    {
      icon: Smartphone,
      title: "Works Everywhere",
      description: "Responsive design that works perfectly on desktop, tablet, and mobile devices."
    },
    {
      icon: Star,
      title: "Always Free",
      description: "No subscriptions, no hidden fees, no limits. Professional image tools, completely free."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                  Fast & Free
                  <span className="bg-gradient-primary bg-clip-text text-transparent block">
                    Image Tools
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl">
                  Professional image processing tools that work directly in your browser. 
                  Compress, resize, crop, and convert images with complete privacy.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button variant="hero" size="lg" asChild>
                  <Link to="/compress">Start Compressing</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link to="/about">Learn More</Link>
                </Button>
              </div>

              <div className="flex items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  <span>100% Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span>Lightning Fast</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-primary" />
                  <span>Always Free</span>
                </div>
              </div>
            </div>

            <div className="relative animate-slide-up">
              <div className="absolute inset-0 bg-gradient-primary opacity-20 blur-3xl transform rotate-3"></div>
              <img 
                src={heroImage} 
                alt="ImageTools Hero" 
                className="relative rounded-2xl shadow-strong w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Powerful Image Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to process, optimize, and transform your images. 
              All tools work offline in your browser for maximum privacy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {tools.map((tool, index) => (
              <Card key={tool.title} className="bg-gradient-card border-0 shadow-medium hover:shadow-strong transition-all duration-300 group">
                <CardHeader className="text-center pb-4">
                  <div className={`inline-flex p-3 rounded-lg bg-gradient-primary/10 mb-4 group-hover:bg-gradient-primary/20 transition-colors`}>
                    <tool.icon className={`h-6 w-6 ${tool.color}`} />
                  </div>
                  <CardTitle className="text-xl">{tool.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button variant="outline" asChild className="w-full group-hover:border-primary group-hover:text-primary transition-colors">
                    <Link to={tool.href}>Use Tool</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose ImageTools?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Built with modern web technologies to provide the best image processing experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="text-center group">
                <div className="inline-flex p-4 rounded-xl bg-gradient-primary/10 mb-4 group-hover:bg-gradient-primary/20 transition-colors">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to optimize your images?
            </h2>
            <p className="text-xl opacity-90 mb-8">
              Join thousands of users who trust ImageTools for their image processing needs. 
              Start using our tools today - no registration required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="secondary" size="lg" asChild>
                <Link to="/compress">Get Started Free</Link>
              </Button>
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary" asChild>
                <Link to="/about">Learn More</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;