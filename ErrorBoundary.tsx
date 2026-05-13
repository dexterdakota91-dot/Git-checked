import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-black p-6 text-center">
          <div className="mb-6 rounded-full bg-red-500/10 p-4 text-red-500 border border-red-500/20">
            <AlertTriangle size={48} />
          </div>
          <h1 className="mb-2 text-2xl font-display font-bold text-foreground">Aetheris_Link_Fracture</h1>
          <p className="mb-8 max-w-md text-sm text-muted-foreground font-mono">
            The neural link has experienced a critical desynchronization. 
            <br />
            <span className="text-red-400">Error: {this.state.error?.message || 'Unknown desync'}</span>
          </p>
          <Button 
            className="monolith-btn-elevated"
            onClick={() => window.location.reload()}
          >
            <RotateCcw className="mr-2" size={18} />
            Re-establish Link
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
