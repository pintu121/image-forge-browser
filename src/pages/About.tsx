import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Zap, Star, Smartphone, Lock, Globe, Heart } from "lucide-react";

const features = [
  { icon: Shield, title: "100% Private", desc: "Images never leave your device. All processing is client-side." },
  { icon: Zap, title: "Lightning Fast", desc: "Instant processing with zero upload wait time." },
  { icon: Star, title: "Always Free", desc: "No subscriptions, no hidden fees, no usage limits." },
  { icon: Smartphone, title: "Works Everywhere", desc: "Responsive design for desktop, tablet, and mobile." },
];

const values = [
  { icon: Lock, title: "Privacy by Design", desc: "We can't see your images because they never reach our servers. Zero-knowledge architecture means your data stays yours." },
  { icon: Globe, title: "Open & Accessible", desc: "Works in any modern browser, on any device. No downloads, no installations, no accounts required." },
  { icon: Heart, title: "Built with Care", desc: "Every tool is crafted with attention to detail, using the latest web technologies for the best possible experience." },
];

const About = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto py-12 px-4 space-y-12">
          {/* Hero */}
          <div className="text-center space-y-4 animate-fade-in max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              About ImageTools
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Professional image processing that respects your privacy. Fast, free, and entirely in your browser.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {features.map((f) => (
              <Card key={f.title} className="bg-gradient-card border-0 shadow-soft text-center group hover:shadow-medium transition-all">
                <CardContent className="p-6 space-y-3">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors">
                    <f.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Values */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold text-center">What We Stand For</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((v) => (
                <Card key={v.title} className="bg-gradient-card border-0 shadow-soft">
                  <CardContent className="p-6 space-y-3">
                    <div className="p-2 bg-accent/10 rounded-lg w-fit">
                      <v.icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-8">
            <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/10 max-w-2xl mx-auto">
              <CardContent className="p-8 space-y-3">
                <h2 className="text-2xl font-bold">Ready to get started?</h2>
                <p className="text-muted-foreground">No sign-up needed. Just pick a tool and go.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
