import React from 'react';
import { motion } from 'motion/react';
import { useStore } from '../../store/useStore';
import { MonolithLogo, AetherisTextLogo } from '../logos/LogoComponents';
import { Button } from '@/components/ui/button';
import { LogIn, Sparkles, ShieldCheck, Zap, AlertCircle, Loader2 } from 'lucide-react';

/**
 * Render the full-screen, centered login interface with branding, animated background effects, a Google sign-in button (with loading/disabled state), conditional error alert, feature badges, and a system-status footer.
 *
 * @returns A JSX element that renders the complete login view.
 */
export function LoginView() {
  const { handleLogin, loginError, isLoggingIn } = useStore();

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        
        {/* Subtle Grid */}
        <div className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="flex flex-col items-center text-center space-y-8">
          {/* Brand Logo Section */}
          <div className="relative group">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative p-6 rounded-3xl bg-secondary/30 backdrop-blur-xl border border-white/10 shadow-2xl">
              <MonolithLogo size={80} agents={[]} />
            </div>
          </div>

          <div className="space-y-2">
            <AetherisTextLogo size={48} />
            <p className="text-muted-foreground text-sm tracking-[0.2em] uppercase font-medium">
              Autonomous Venture System
            </p>
          </div>

          <div className="space-y-4 w-full">
            <h1 className="text-2xl font-bold font-display tracking-tight text-white">
              Initialize Command Center
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Authenticate via Secure Neural Gateway to access your architected ventures and agentic coordination.
            </p>
          </div>

          <div className="space-y-4 w-full pt-4">
            {/* FIX: Show error message when auth fails */}
            {loginError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-left"
              >
                <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-300 leading-relaxed">{loginError}</p>
              </motion.div>
            )}

            {/* FIX: Added isLoggingIn loading state and disabled state to prevent double-click */}
            <Button 
              size="lg" 
              className="w-full bg-white text-black hover:bg-zinc-200 transition-all duration-300 h-14 text-base font-bold shadow-[0_0_20px_rgba(255,255,255,0.1)] group disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={handleLogin}
              disabled={isLoggingIn}
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={20} />
                  Connecting...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 group-hover:translate-x-1 transition-transform" size={20} />
                  Sign In with Google
                </>
              )}
            </Button>
            
            <div className="grid grid-cols-3 gap-4 pt-6">
              <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <ShieldCheck size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <Zap size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Instant</span>
              </div>
              <div className="flex flex-col items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <Sparkles size={16} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Agentic</span>
              </div>
            </div>
          </div>
        </div>

        {/* System Status Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/30 backdrop-blur-md border border-white/5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[9px] uppercase tracking-tighter text-muted-foreground font-semibold">
              All Systems Operational — Aetheris v3.1.2 
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
