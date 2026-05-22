  // eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  windowError: any;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    error: null,
    errorInfo: null,
    windowError: null
  };

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({ windowError: event.error || event.message || "Unknown window error" });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({ windowError: event.reason || "Unhandled promise rejection" });
  };

  public componentDidMount() {
    window.addEventListener('error', this.handleWindowError);
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener('error', this.handleWindowError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  public static getDerivedStateFromError(error: Error): State {
    return { error, errorInfo: null, windowError: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private safeStringifyError(err: any): string {
    if (!err) return "Unknown error";
    if (typeof err === "string") return err;
    if (err instanceof Error) {
      try {
        const parsed = JSON.parse(err.message);
        if (parsed?.error && parsed?.operationType) {
          return `Firestore Error: ${parsed.error} during ${parsed.operationType}`;
        }
      } catch {
        return err.message;
      }
    }
    
    try {
      return JSON.stringify(err);
    } catch {
      try {
        return Object.prototype.toString.call(err);
      } catch {
        return "Un-stringifiable error object";
      }
    }
  }

  public render() {
    const errorToDisplay = this.state.error || this.state.windowError;

    if (errorToDisplay) {
      const errorMessage = this.safeStringifyError(errorToDisplay);

      return (
        <div className="h-screen flex items-center justify-center bg-background p-4">
          <Card className="glass border-none max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertCircle /> System Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground break-words">{errorMessage}</p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => window.location.reload()}>Reload Application</Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
