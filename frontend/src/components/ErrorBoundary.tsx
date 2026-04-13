import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6 mx-auto">
            <AlertTriangle className="w-10 h-10 text-destructive" />
          </div>
          <h1 className="text-3xl font-bold mb-3 tracking-tight">काहीतरी चूक झाली!</h1>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            आम्हाला क्षमा करा, पण तांत्रिक अडचणीमुळे हे पान लोड होऊ शकले नाही.
            कृपया थोड्या वेळाने पुन्हा प्रयत्न करा.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={this.handleReload} size="lg" className="w-full sm:w-auto">
              <RefreshCw className="mr-2 h-4 w-4" /> पृष्ठ रीफ्रेश करा
            </Button>
            <Button variant="outline" size="lg" asChild className="w-full sm:w-auto">
              <Link to="/">
                <Home className="mr-2 h-4 w-4" /> मुख्यपृष्ठावर जा
              </Link>
            </Button>
          </div>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <div className="mt-10 p-4 bg-muted rounded-lg max-w-full overflow-auto text-left text-xs font-mono text-muted-foreground w-full max-w-2xl border border-border">
              <p className="font-bold text-foreground mb-2">{this.state.error.message}</p>
              <pre>{this.state.error.stack}</pre>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
