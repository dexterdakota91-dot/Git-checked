import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Button, buttonVariants } from '@/components/ui/button';
import { X } from 'lucide-react';
import { ElectricityTracer } from './ElectricityTracer';
import { US_STATES } from '../constants/mockData';
import { cn } from '@/lib/utils';
import { useStore } from '../store/useStore';

import { AetherisLogo } from './logos/LogoComponents';

interface OnboardingDialogProps {
  completeOnboarding: () => void;
  setActiveTab: (tab: string) => void;
}

export function OnboardingDialog({
  completeOnboarding,
  setActiveTab
}: OnboardingDialogProps) {
  const { 
    showOnboarding, setShowOnboarding,
    userState, setUserState
  } = useStore();
  return (
    <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
      <DialogContent className="glass border-none sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <AetherisLogo size={48} />
          </div>
          <DialogTitle className="text-2xl font-display text-center">Welcome to Aetheris Ventures</DialogTitle>
          <DialogDescription className="text-center">
            Initialize your agentic environment and set up your regional compliance profile.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Your State</label>
            <select 
              className="w-full bg-secondary border border-border rounded-md p-2 text-sm"
              value={userState}
              onChange={(e) => setUserState(e.target.value)}
            >
              <option value="">Select a state...</option>
              {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" className="rounded border-border bg-secondary" />
            <label htmlFor="terms" className="text-xs text-muted-foreground">
              I agree to the <button onClick={() => { setShowOnboarding(false); setActiveTab('legal'); }} className="text-primary hover:underline">Terms of Service</button> and <button onClick={() => { setShowOnboarding(false); setActiveTab('legal'); }} className="text-primary hover:underline">Privacy Policy</button>.
            </label>
          </div>
        </div>
        <DialogFooter>
          <button 
            className="w-full monolith-btn-elevated relative overflow-hidden group" 
            disabled={!userState} 
            onClick={completeOnboarding}
          >
            <ElectricityTracer color="primary" duration={3} />
            <span className="relative z-10">Initialize Environment</span>
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
