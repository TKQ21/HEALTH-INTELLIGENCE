import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="glass rounded-xl p-8 border border-destructive/30 text-center max-w-md space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6 text-destructive" />
            </div>
            <h3 className="font-display text-lg text-foreground">Something went wrong</h3>
            <p className="text-sm text-muted-foreground">{this.state.error?.message || "An unexpected error occurred."}</p>
            <Button
              onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
              className="bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 hover:bg-neon-cyan/30"
            >
              <RefreshCw className="w-4 h-4 mr-2" /> Reload
            </Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
