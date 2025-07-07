import { Layout } from "@/components/Layout";

const About = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">About ImageTools</h1>
            <p className="text-xl text-muted-foreground">
              Your privacy-first image processing solution
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-card rounded-lg shadow-medium p-6 border">
              <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
              <p className="text-muted-foreground">
                We believe image editing should be fast, free, and completely private. 
                ImageTools processes all images directly in your browser, ensuring your 
                files never leave your device.
              </p>
            </div>

            <div className="bg-card rounded-lg shadow-medium p-6 border">
              <h2 className="text-2xl font-semibold mb-4">Privacy First</h2>
              <p className="text-muted-foreground">
                All image processing happens client-side in your browser. We don't 
                store, upload, or have access to any of your images. What happens 
                on your device, stays on your device.
              </p>
            </div>
          </div>

          <div className="bg-gradient-card rounded-lg shadow-medium p-8 border">
            <h2 className="text-2xl font-semibold mb-4 text-center">Why Choose ImageTools?</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <h3 className="font-semibold mb-2">100% Free</h3>
                <p className="text-sm text-muted-foreground">No subscriptions, no hidden fees</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Client-Side</h3>
                <p className="text-sm text-muted-foreground">Your images never leave your device</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Fast Processing</h3>
                <p className="text-sm text-muted-foreground">Instant results, no waiting</p>
              </div>
              <div className="text-center">
                <h3 className="font-semibold mb-2">Modern Tools</h3>
                <p className="text-sm text-muted-foreground">Latest web technologies</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;