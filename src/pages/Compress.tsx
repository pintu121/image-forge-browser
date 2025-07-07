import { Layout } from "@/components/Layout";

const Compress = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Compressor</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Reduce your image file size while maintaining quality. Perfect for web optimization and storage savings.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-medium p-8 border">
            <div className="text-center">
              <p className="text-muted-foreground">Image compression tool coming soon...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This tool will allow you to compress images while maintaining optimal quality for web use.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Compress;