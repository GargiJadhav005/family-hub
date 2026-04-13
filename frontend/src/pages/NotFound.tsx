import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <GraduationCap className="w-16 h-16 text-primary mx-auto" />
        <h1 className="text-6xl font-extrabold text-primary">४०४</h1>
        <p className="text-lg text-muted-foreground">हे पृष्ठ सापडले नाही</p>
        <Link to="/">
          <Button className="mt-4">← मुख्यपृष्ठावर परत जा</Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;