import React from 'react';
import { AlertCircle } from 'lucide-react';

export function AIAcknowlegementFooter() {
  return (
    <footer className="mt-auto py-4 px-6 bg-muted/20 border-t border-white/5 text-center text-[10px] text-muted-foreground">
      <div className="flex items-center justify-center gap-2 mb-1">
        <AlertCircle size={12} className="text-primary" />
        <span className="font-semibold uppercase tracking-wider">AI Disclosure</span>
      </div>
      <p className="max-w-xl mx-auto px-4">
        Aetheris Ventures utilizes advanced AI models. Outputs are conceptual and should be independently verified. We do not provide legal, financial, or professional advice. User discretion is advised.
      </p>
    </footer>
  );
}
