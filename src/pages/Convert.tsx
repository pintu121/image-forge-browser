import { Layout } from "@/components/Layout";

const Convert = () => {
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Image Converter</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Convert images between different formats. Support for JPG, PNG, WEBP, BMP, GIF, and HEIC formats.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-medium p-8 border">
            <div className="text-center">
              <p className="text-muted-foreground">Image conversion tool coming soon...</p>
              <p className="text-sm text-muted-foreground mt-2">
                This tool will allow you to convert between JPG, PNG, WEBP, BMP, GIF, and HEIC formats.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Convert;