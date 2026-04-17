import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setError(event.error);
    };
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (error) {
    let errorMessage = "Something went wrong.";
    try {
      const firestoreError = JSON.parse(error.message);
      errorMessage = `Firestore Error: ${firestoreError.error} during ${firestoreError.operationType}`;
    } catch (e) {
      errorMessage = error?.message || errorMessage;
    }
    return (
      <div className="h-screen flex items-center justify-center bg-background p-4">
        <Card className="glass border-none max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircle /> System Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.reload()}>Reload Application</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  return <>{children}</>;
}
