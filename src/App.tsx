/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useFirebaseListeners } from './hooks/useFirebaseListeners';
import { AppShell } from './components/layout/AppShell';
import { ArchitectChat } from './components/ArchitectChat';
import { OnboardingDialog } from './components/OnboardingDialog';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from './store/useStore';
import { doc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AetherisApp />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function AetherisApp() {
  // Initialize Global Firebase Listeners
  useFirebaseListeners();

  const { 
    isBrandingConfirmOpen, setIsBrandingConfirmOpen,
    pendingBrandingUpdate, setPendingBrandingUpdate,
    selectedProject, setSelectedProject,
    setPlaidToken, setPlaidError,
    completeOnboarding,
    activeTab
  } = useStore();

  // Plaid Integration Token Fetcher
  useEffect(() => {
    const fetchLinkToken = async () => {
      try {
        const response = await fetch('/api/plaid/create-link-token', { method: 'POST' });
        
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Received non-JSON response from server");
        }

        const data = await response.json();
        if (data.link_token) {
          setPlaidToken(data.link_token);
          setPlaidError(null);
        } else if (data.error) {
          setPlaidError(data.error);
        }
      } catch (error) {
        console.error("Error fetching Plaid token:", error);
        setPlaidError("Failed to connect to the banking server.");
      }
    };
    fetchLinkToken();
  }, [setPlaidToken, setPlaidError]);

  const handleConfirmBranding = async () => {
    if (!selectedProject || !pendingBrandingUpdate) return;
    
    const { type, value } = pendingBrandingUpdate;
    try {
      const projectRef = doc(db, 'projects', selectedProject.id);
      let updatedBranding = { ...(selectedProject.branding || {}) };
      let updateData: any = {};

      if (type === 'logo') {
        updatedBranding.logoType = value;
      } else if (type === 'name') {
        updatedBranding.selectedName = value;
        updateData.name = value;
      } else if (type === 'palette') {
        updatedBranding.selectedPalette = value;
      } else if (type === 'mission') {
        updatedBranding.missionStatement = value;
      }

      updateData.branding = updatedBranding;
      await updateDoc(projectRef, updateData);
      setSelectedProject({ ...selectedProject, ...updateData });
      setIsBrandingConfirmOpen(false);
      setPendingBrandingUpdate(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `projects/${selectedProject.id}`);
    }
  };

  return (
    <>
      <AppShell />

      {/* Architect Chat Slide-out */}
      <ArchitectChat />

      {/* Onboarding Dialog */}
      <OnboardingDialog 
        completeOnboarding={completeOnboarding}
        setActiveTab={() => {}}
      />

      {/* Branding Confirmation Dialog */}
      <Dialog open={isBrandingConfirmOpen} onOpenChange={setIsBrandingConfirmOpen}>
        <DialogContent className="aetheris-card border-none max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Brand Update</DialogTitle>
            <DialogDescription>
              Are you sure you want to update your brand's {pendingBrandingUpdate?.type}? This will change the visual identity of your venture.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {pendingBrandingUpdate?.type === 'palette' && (
              <div className="flex h-12 rounded-lg overflow-hidden border border-accent/10">
                {pendingBrandingUpdate.value.map((color: string, idx: number) => (
                  <div key={idx} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
            {pendingBrandingUpdate?.type === 'logo' && (
              <div className="flex justify-center p-4 bg-secondary/30 rounded-xl">
                <span className="font-bold text-lg capitalize">{pendingBrandingUpdate.value}</span>
              </div>
            )}
            {pendingBrandingUpdate?.type === 'name' && (
              <div className="p-4 bg-secondary/30 rounded-xl text-center font-display text-2xl font-bold">
                {pendingBrandingUpdate.value}
              </div>
            )}
            {pendingBrandingUpdate?.type === 'mission' && (
              <div className="p-4 bg-secondary/30 rounded-xl text-sm italic">
                "{pendingBrandingUpdate.value}"
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setIsBrandingConfirmOpen(false)}>Cancel</Button>
            <Button onClick={handleConfirmBranding} className="electric-glow">Confirm Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
