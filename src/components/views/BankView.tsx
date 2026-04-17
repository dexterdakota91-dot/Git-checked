import React from 'react';
import { motion } from 'motion/react';
import { Building2, AlertCircle, CheckCircle2, Plus, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useStore } from '../../store/useStore';
import { usePlaidLink, PlaidLinkOptions, PlaidLinkOnSuccess } from 'react-plaid-link';

export default function BankView() {
  const { plaidError, isBankLinked, setIsBankLinked, plaidToken, userState } = useStore();

  const onSuccess = React.useCallback<PlaidLinkOnSuccess>((public_token, metadata) => {
    console.log('Plaid Success:', public_token, metadata);
    setIsBankLinked(true);
  }, [setIsBankLinked]);

  const config: PlaidLinkOptions = {
    token: plaidToken!,
    onSuccess,
  };

  const { open, ready } = usePlaidLink(config);

  return (
    <motion.div
      key="bank"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="max-w-2xl mx-auto space-y-8"
    >
      <div className="text-center space-y-4">
        <Building2 size={48} className="mx-auto text-primary" />
        <h1 className="text-3xl font-bold font-display text-foreground">Bank & Tax Setup</h1>
        <p className="text-muted-foreground">Connect your accounts and get state-specific business tips.</p>
      </div>

      <Card className="aetheris-card border-none">
        <CardHeader>
          <CardTitle className="text-foreground">Link Bank Account</CardTitle>
          <CardDescription className="text-muted-foreground">Securely connect your business bank account via Plaid (Simulation)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {plaidError && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start gap-3 text-destructive animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <p className="text-sm font-bold">Configuration Required</p>
                <p className="text-xs opacity-80 leading-relaxed">{plaidError}</p>
              </div>
            </div>
          )}
          {isBankLinked ? (
            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <CheckCircle2 className="text-primary" />
              <div>
                <p className="font-medium text-foreground">Chase Business Checking Linked</p>
                <p className="text-xs text-muted-foreground">Account ending in ****4290</p>
              </div>
            </div>
          ) : (
            <Button 
              className="w-full electric-glow h-12 text-base font-medium" 
              onClick={() => open()}
              disabled={!ready}
            >
              <Plus className="mr-2" /> Connect with Plaid
            </Button>
          )}
        </CardContent>
      </Card>

      {userState && (
        <Card className="aetheris-card border-none bg-accent/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <MapPin className="text-accent" />
              <CardTitle className="text-lg text-foreground">{userState} Business Tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-background/30 border border-accent/10">
              <p className="font-bold text-accent mb-1">Entity Formation</p>
              <p className="text-muted-foreground">In {userState}, you should consider filing as an LLC to protect personal assets. Check the Secretary of State website for filing fees.</p>
            </div>
            <div className="p-3 rounded-lg bg-background/30 border border-accent/10">
              <p className="font-bold text-accent mb-1">Tax Obligations</p>
              <p className="text-muted-foreground">Register for a state tax ID. {userState} may have specific gross receipts taxes or franchise taxes for AI-driven businesses.</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-[10px] text-muted-foreground italic">Disclaimer: These tips are AI-generated and do not constitute legal or tax advice.</p>
          </CardFooter>
        </Card>
      )}
    </motion.div>
  );
}
