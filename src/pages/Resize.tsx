import { Layout } from "@/components/Layout";

const Resize = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Resizer</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Resize your images to custom dimensions or by percentage. Maintain aspect ratio or stretch to fit.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-medium p-8 border">
            <div className="text-center">
              <p className="text-muted-foreground">Image resizing tool coming soon...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This tool will allow you to resize images to specific dimensions or scale by percentage.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Resize;