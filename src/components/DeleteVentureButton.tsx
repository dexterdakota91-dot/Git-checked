import React, { useState, useEffect, useRef } from 'react';
import { Trash2, AlertTriangle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DeleteButtonProps {
  projectId: string;
  onDelete: (projectId: string, e?: React.MouseEvent) => void;
  iconOnly?: boolean;
}

export const DeleteVentureButton: React.FC<DeleteButtonProps> = ({ projectId, onDelete, iconOnly = false }) => {
  const [stage, setStage] = useState<'idle' | 'confirm1' | 'confirm2'>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const reset = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStage('idle');
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (stage === 'idle') {
      setStage('confirm1');
      timerRef.current = setTimeout(reset, 5000);
    } else if (stage === 'confirm1') {
      setStage('confirm2');
      // Keep the timer running for the second click
    } else if (stage === 'confirm2') {
      onDelete(projectId, e);
      reset();
    }
  };

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        className={`absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md transition-all ${
          stage === 'idle' ? 'text-muted-foreground/30 hover:text-destructive hover:bg-destructive/10' :
          stage === 'confirm1' ? 'text-orange-500 bg-orange-500/10' :
          'text-destructive bg-destructive/20'
        }`}
        title="Delete Venture"
      >
        {stage === 'idle' && <Trash2 size={14} />}
        {stage === 'confirm1' && <AlertTriangle size={14} />}
        {stage === 'confirm2' && <Check size={14} />}
      </button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`text-destructive hover:bg-destructive/10 ${stage !== 'idle' ? 'bg-destructive/20' : ''}`}
      onClick={handleClick}
    >
      {stage === 'idle' && <Trash2 size={16} className="mr-2" />}
      {stage === 'confirm1' && <span className="mr-2">Confirm?</span>}
      {stage === 'confirm2' && <span className="mr-2">Are you sure?</span>}
      {stage === 'idle' ? 'Delete Venture' : 'Confirm'}
    </Button>
  );
};
