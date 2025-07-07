import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl font-semibold mb-4">Page Not Found</h2>
            <p className="text-muted-foreground mb-8">
              Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button asChild size="lg">
              <Link to="/">Go Home</Link>
            </Button>
            <div className="text-sm text-muted-foreground">
              Or try one of our tools: 
              <Link to="/compress" className="text-primary hover:underline ml-1">Compress</Link>,
              <Link to="/resize" className="text-primary hover:underline ml-1">Resize</Link>,
              <Link to="/crop" className="text-primary hover:underline ml-1">Crop</Link>, or
              <Link to="/convert" className="text-primary hover:underline ml-1">Convert</Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
