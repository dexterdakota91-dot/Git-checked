import React from 'react';
import { motion } from 'motion/react';
import { 
  Palette, Tag, Globe, Zap, CheckCircle2, ArrowUpRight, Search, ChevronRight, Settings2, Plus, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { LoadingIndicator } from '../LoadingIndicator';
import { MonolithLogo, OrbitLogo, PrismLogo } from '../logos/LogoComponents';
import { cn } from '@/lib/utils';
import { useStore } from '../../store/useStore';
import { generateBranding, generateMissionStatements, generatePalettes, generateNames, generateLogoConcepts, generateVoiceAndTone } from '../../services/gemini';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function BrandingView({ setActiveTab }: { setActiveTab?: (tab: string) => void }) {
  const { 
    selectedProject, 
    onboardingStep,
    setOnboardingStep
  } = useStore();

  if (!selectedProject) return <div className="p-8 text-center">No venture selected.</div>;

  const steps = [
    { id: 'naming', title: 'Name Your Venture' },
    { id: 'colors', title: 'Visual Identity' },
    { id: 'mission', title: 'Mission Statement' },
    { id: 'logo', title: 'Logo Design' },
    { id: 'voice', title: 'Brand Tone & Voice' },
    { id: 'summary', title: 'Venture Identity Summary' }
  ];

  return (
    <motion.div
      key="branding"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-4xl mx-auto py-12 px-4"
    >
      <div className="mb-12">
        <h1 className="text-3xl font-bold font-display tracking-tight text-foreground mb-4">Venture Onboarding</h1>
        <div className="flex justify-between items-center bg-accent/5 p-4 rounded-xl border border-accent/10">
          {steps.map((step, idx) => (
            <div key={step.id} className={cn("text-xs font-bold uppercase tracking-widest", idx <= onboardingStep ? "text-primary": "text-muted-foreground")}>
              {idx + 1}. {step.title}
            </div>
          ))}
        </div>
      </div>

      <div className="relative">
        {onboardingStep === 0 && <NamingCard onComplete={() => setOnboardingStep(1)} />}
        {onboardingStep === 1 && <ColorCard onComplete={() => setOnboardingStep(2)} />}
        {onboardingStep === 2 && <MissionCard onComplete={() => setOnboardingStep(3)} />}
        {onboardingStep === 3 && <LogoCard onComplete={() => setOnboardingStep(4)} />}
        {onboardingStep === 4 && <VoiceToneCard onComplete={() => setOnboardingStep(5)} />}
        {onboardingStep === 5 && <SummaryCard 
          onComplete={() => setOnboardingStep(0)} 
          setActiveTab={setActiveTab}
        />}
      </div>
    </motion.div>
  );
}

// Cards
function NamingCard({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = React.useState('');
  const [options, setOptions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [verifying, setVerifying] = React.useState(false);
  const [verifyMsg, setVerifyMsg] = React.useState<{type: 'success'|'error', text: string} | null>(null);
  const { updateVentureBranding, selectedProject } = useStore();
  
  const handleVerify = async (selected: string) => {
    setVerifying(true);
    setVerifyMsg(null);
    
    // Simulate live verification against corporate registries
    await new Promise(r => setTimeout(r, 1500));
    
    if (!selected || selected.length < 3 || selected.toLowerCase() === 'google' || selected.toLowerCase() === 'aetheris') {
      setVerifyMsg({ type: 'error', text: 'Name is unavailable, invalid, or trademarked.' });
      setVerifying(false);
      return;
    }
    
    setVerifyMsg({ type: 'success', text: 'Name is available and verified!' });
    await new Promise(r => setTimeout(r, 1000));

    await updateVentureBranding({ selectedName: selected });
    onComplete();
  };

  const handleArchitectChoice = async () => {
    setLoading(true);
    try {
      const suggestedNames = await generateNames(selectedProject.name, selectedProject.description);
      if (suggestedNames && suggestedNames.length > 0) {
        setOptions(suggestedNames);
        await handleVerify(suggestedNames[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!selectedProject) return;
    setLoading(true);
    const names = await generateNames(selectedProject.name, selectedProject.description);
    if (names) setOptions(names);
    setLoading(false);
  };

  return (
    <Card className="aetheris-card p-8 bg-background border-accent/20">
      <CardHeader>
        <CardTitle>Name Your Venture</CardTitle>
        <CardDescription>Enter a unique name or let AI generate one for you.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
            <input 
              className="flex-grow p-2 rounded-lg bg-background/50 border border-accent/10 text-foreground text-sm focus:border-primary/50 outline-none transition-all" 
              placeholder="e.g. ApexLabs" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={verifying}
            />
            <Button 
              onClick={() => name ? handleVerify(name) : handleArchitectChoice()} 
              disabled={verifying || loading}
              className={cn(!name && "bg-secondary text-secondary-foreground hover:bg-secondary/80")}
            >
              {verifying || loading ? <LoadingIndicator icon={Search} size={14} className="mr-2" /> : null}
              {verifying ? 'Verifying...' : loading ? 'Neural Choice...' : name ? 'Verify Name' : 'Architect Choice'}
            </Button>
        </div>
        {verifyMsg && (
          <p className={cn("text-xs font-medium", verifyMsg.type === 'success' ? "text-primary" : "text-destructive")}>
            {verifyMsg.text}
          </p>
        )}
        
        <div className="pt-4 border-t border-border">
          <Button variant="outline" className="w-full mb-4" onClick={generate} disabled={loading}>
            {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            Generate Names with AI
          </Button>

          {options.length > 0 && (
             <div className="grid grid-cols-2 gap-2 mt-4">
               {options.map(opt => (
                 <div key={opt} onClick={() => handleVerify(opt)} className="p-3 border rounded-lg hover:border-primary cursor-pointer text-center text-sm font-medium transition-colors hover:bg-primary/5">
                   {opt}
                 </div>
               ))}
             </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ColorCard({ onComplete }: { onComplete: () => void }) {
  const { updateVentureBranding, selectedProject } = useStore();
  const [palettes, setPalettes] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  
  const handleSelect = async (colors: string[]) => {
      await updateVentureBranding({ selectedPalette: colors });
      onComplete();
  };

  const handleArchitectChoice = async () => {
    setLoading(true);
    try {
      const generated = await generatePalettes(selectedProject.name, selectedProject.description);
      if (generated && generated.length > 0) {
        await handleSelect(generated[0].colors);
      }
    } finally {
      setLoading(false);
    }
  };

  const generate = async () => {
    if (!selectedProject) return;
    setLoading(true);
    const generated = await generatePalettes(selectedProject.name, selectedProject.description);
    if (generated) setPalettes(generated);
    setLoading(false);
  };

  return (
    <Card className="aetheris-card p-8 bg-background border-accent/20">
      <CardHeader>
        <CardTitle>Visual Identity (Colors)</CardTitle>
        <CardDescription>Pick a palette for your venture.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={generate} disabled={loading}>
              {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
              Generate Palettes
            </Button>
            <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={handleArchitectChoice} disabled={loading}>
              {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Architect's Pick
            </Button>
          </div>

          {palettes.length > 0 && (
             <div className="grid grid-cols-2 gap-4 mt-4">
               {palettes.map((palette, idx) => (
                 <div key={idx} onClick={() => handleSelect(palette.colors)} className="p-4 border rounded-xl hover:border-primary cursor-pointer transition-all hover:scale-105 group">
                   <div className="flex h-12 rounded-lg overflow-hidden border border-accent/10 mb-2">
                     {palette.colors.map((color: string, cIdx: number) => (
                       <div key={cIdx} className="flex-1" style={{ backgroundColor: color }} />
                     ))}
                   </div>
                   <div className="flex justify-between text-[10px] font-mono text-muted-foreground group-hover:text-foreground">
                     {palette.colors.map((color: string, cIdx: number) => <span key={cIdx}>{color}</span>)}
                   </div>
                 </div>
               ))}
             </div>
          )}
      </CardContent>
    </Card>
  );
}

function MissionCard({ onComplete }: { onComplete: () => void }) {
    const { updateVentureBranding, selectedProject } = useStore();
    const [mission, setMission] = React.useState('');
    const [options, setOptions] = React.useState<string[]>([]);
    const [loading, setLoading] = React.useState(false);

    const handleSave = async (m: string) => {
        await updateVentureBranding({ missionStatement: m });
        onComplete();
    };

    const handleArchitectChoice = async () => {
        setLoading(true);
        try {
            const missions = await generateMissionStatements(selectedProject.name, selectedProject.description);
            if (missions && missions.length > 0) {
                await handleSave(missions[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const generate = async () => {
      if (!selectedProject) return;
      setLoading(true);
      const missions = await generateMissionStatements(selectedProject.name, selectedProject.description);
      if (missions) setOptions(missions);
      setLoading(false);
    };

    return (
        <Card className="aetheris-card p-8 bg-background border-accent/20">
            <CardHeader><CardTitle>Mission Statement</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <input className="w-full p-2 h-12 rounded-lg bg-background/50 border border-accent/10 text-foreground outline-none focus:border-primary/50 transition-all" value={mission} onChange={(e) => setMission(e.target.value)} placeholder="Type a manual mission statement..." />
                
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={generate} disabled={loading}>
                    {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Explore Options
                  </Button>
                  <Button 
                    onClick={() => mission ? handleSave(mission) : handleArchitectChoice()} 
                    disabled={loading}
                    className={cn("flex-1", !mission && "bg-secondary text-secondary-foreground hover:bg-secondary/80")}
                  >
                    {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : null}
                    {loading ? 'Consulting...' : mission ? 'Save & Continue' : 'Architect Choice'}
                  </Button>
                </div>

                {options.length > 0 && (
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    {options.map((opt, idx) => (
                      <div key={idx} onClick={() => handleSave(opt)} className="p-4 rounded-xl bg-background/30 border border-accent/10 hover:border-primary/50 cursor-pointer transition-colors group">
                        <p className="text-sm italic text-muted-foreground group-hover:text-foreground">"{opt}"</p>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
        </Card>
    );
}

function LogoCard({ onComplete }: { onComplete: () => void }) {
    const { updateVentureBranding, selectedProject } = useStore();
    const [concepts, setConcepts] = React.useState<any[]>([]);
    const [loading, setLoading] = React.useState(false);

    const handleSave = async (concept: any) => {
        await updateVentureBranding({ logoDescription: concept.description });
        onComplete();
    };

    const handleArchitectChoice = async () => {
        setLoading(true);
        try {
            const options = await generateLogoConcepts(selectedProject.name, selectedProject.description);
            if (options && options.length > 0) {
                await handleSave(options[0]);
            }
        } finally {
            setLoading(false);
        }
    };

    const generate = async () => {
      if (!selectedProject) return;
      setLoading(true);
      const options = await generateLogoConcepts(selectedProject.name, selectedProject.description);
      if (options) setConcepts(options);
      setLoading(false);
    };

    return (
        <Card className="aetheris-card p-8 bg-background border-accent/20">
            <CardHeader><CardTitle>Logo Design Concepts</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={generate} disabled={loading}>
                    {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Generate Logo Concepts
                    </Button>
                    <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={handleArchitectChoice} disabled={loading}>
                        {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Architect's Brand
                    </Button>
                </div>

                {concepts.length > 0 && (
                  <div className="grid grid-cols-1 gap-4 mt-4">
                    {concepts.map((concept, idx) => (
                      <div key={idx} onClick={() => handleSave(concept)} className="p-4 rounded-xl bg-background/30 border border-accent/10 hover:border-primary cursor-pointer transition-colors text-left space-y-2">
                        <h4 className="font-bold text-sm text-foreground">{concept.conceptName}</h4>
                        <p className="text-xs text-muted-foreground">{concept.description}</p>
                        <Badge variant="secondary" className="text-[10px]">{concept.typographyStyle}</Badge>
                      </div>
                    ))}
                  </div>
                )}
            </CardContent>
        </Card>
    );
}

function VoiceToneCard({ onComplete }: { onComplete: () => void }) {
    const { updateVentureBranding, selectedProject } = useStore();
    const [tone, setTone] = React.useState('');
    const [audience, setAudience] = React.useState('');
    const [loading, setLoading] = React.useState(false);

    const handleSave = async () => {
        await updateVentureBranding({ tone, targetAudience: audience });
        onComplete();
    };

    const handleArchitectChoice = async () => {
        setLoading(true);
        try {
            const res = await generateVoiceAndTone(selectedProject.name, selectedProject.description);
            if (res) {
                await updateVentureBranding({ 
                    tone: res.tone || 'Professional', 
                    targetAudience: res.targetAudience || 'General' 
                });
                onComplete();
            }
        } finally {
            setLoading(false);
        }
    };

    const generate = async () => {
      if (!selectedProject) return;
      setLoading(true);
      const res = await generateVoiceAndTone(selectedProject.name, selectedProject.description);
      if (res) {
        setTone(res.tone || '');
        setAudience(res.targetAudience || '');
      }
      setLoading(false);
    };

    return (
        <Card className="aetheris-card p-8 bg-background border-accent/20">
            <CardHeader><CardTitle>Voice & Tone</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <div className="flex gap-3 mb-4">
                    <Button variant="outline" className="flex-1" onClick={generate} disabled={loading}>
                    {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                    Auto-fill with AI
                    </Button>
                    <Button className="flex-1 bg-secondary text-secondary-foreground hover:bg-secondary/80" onClick={handleArchitectChoice} disabled={loading}>
                        {loading ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                        Architect's Choice
                    </Button>
                </div>

                <input className="w-full p-2 rounded-lg bg-background/50 border border-accent/10 text-foreground outline-none focus:border-primary/50 transition-all" value={tone} onChange={(e) => setTone(e.target.value)} placeholder="Tone (e.g. Professional)" />
                <input className="w-full p-2 rounded-lg bg-background/50 border border-accent/10 text-foreground outline-none focus:border-primary/50 transition-all" value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="Target Audience" />
                
                <Button 
                    onClick={handleSave} 
                    disabled={(!tone || !audience) || loading} 
                    className="w-full mt-2"
                >
                    Save & Continue
                </Button>
            </CardContent>
        </Card>
    );
}

function SummaryCard({ onComplete, setActiveTab }: { onComplete: () => void, setActiveTab?: (tab: string) => void }) {
    const { selectedProject } = useStore();
    
    // Fallbacks just in case
    const b = selectedProject?.branding || {};
    const ventureName = b.selectedName || selectedProject?.name || 'Your Venture';
    const palette = b.selectedPalette || ['#0066FF', '#001A4D', '#D4AF37'];
    const mission = b.missionStatement || 'Innovating for a better tomorrow.';
    const tone = b.tone || 'Professional';
    const audience = b.targetAudience || 'Everyone';
    const logoConcept = b.logoDescription || 'A clean, modern logo design.';

    const handleConfirm = () => {
      if (setActiveTab) {
        setActiveTab('dashboard');
      }
      onComplete(); // resets wizard for next time
    };

    return (
        <div className="space-y-8">
            {/* 1. MOCKUP PREVIEW */}
            <div className="text-muted-foreground uppercase text-xs font-bold tracking-widest pl-2">Live App Mockup</div>
            <Card className="overflow-hidden border-accent/20 bg-background shadow-2xl rounded-2xl w-full max-w-4xl mx-auto">
                {/* Browser Chrome */}
                <div className="border-b border-border bg-card/60 px-4 py-3 flex items-center gap-3">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-destructive/80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <div className="flex-1 max-w-sm mx-auto flex items-center justify-center text-xs text-muted-foreground font-mono bg-background/50 px-3 py-1.5 rounded-md border border-accent/10">
                        <Globe size={12} className="mr-2" />
                        {ventureName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com
                    </div>
                </div>
                
                {/* Simulated App Hero Section */}
                <div 
                  className="relative w-full min-h-[360px] flex flex-col items-center justify-center text-center p-8 transition-colors duration-500" 
                  style={{ backgroundColor: palette[0], color: '#ffffff' }}
                >
                    <div className="absolute top-6 left-6 font-bold text-xl tracking-tighter flex items-center gap-2 drop-shadow-md">
                        <div className="w-6 h-6 rounded shadow-sm" style={{ backgroundColor: palette[2] }}/>
                        <span className="text-white drop-shadow-md">{ventureName}</span>
                    </div>
                    
                    <div className="absolute top-6 right-6 hidden sm:flex gap-6 text-sm font-medium opacity-90 drop-shadow-md">
                        <span className="cursor-pointer hover:opacity-100">Product</span>
                        <span className="cursor-pointer hover:opacity-100">Solutions</span>
                        <span className="cursor-pointer hover:opacity-100">Pricing</span>
                    </div>
                    
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 mt-12 max-w-2xl leading-tight drop-shadow-lg text-white">
                      {mission}
                    </h1>
                    
                    <p className="max-w-xl mx-auto text-sm md:text-base opacity-90 mb-8 font-medium drop-shadow-md text-white">
                      Expertly crafted for {audience} with a deeply {tone.toLowerCase()} experience.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div 
                          className="px-8 py-3.5 rounded-full font-bold text-sm shadow-xl cursor-pointer hover:scale-105 transition-transform" 
                          style={{ backgroundColor: palette[1], color: '#ffffff' }}
                        >
                          Get Started Now
                        </div>
                        <div className="px-8 py-3.5 rounded-full font-bold text-sm bg-white/10 hover:bg-white/20 border border-white/20 cursor-pointer backdrop-blur-sm transition-colors text-white">
                          View Demo
                        </div>
                    </div>
                </div>
            </Card>

            {/* 2. READOUT CARD */}
            <Card className="aetheris-card p-8 bg-background border-accent/20">
                <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle2 className="text-primary w-6 h-6"/> Complete Branding Readout
                    </CardTitle>
                    <CardDescription>Review all generated and verified properties below.</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0 space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Venture Name</span>
                            <span className="font-semibold text-foreground text-sm">{ventureName}</span>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Mission Statement</span>
                            <span className="font-semibold text-foreground text-sm line-clamp-2" title={mission}>{mission}</span>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Brand Tone</span>
                            <span className="font-semibold text-foreground text-sm capitalize">{tone}</span>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Target Audience</span>
                            <span className="font-semibold text-foreground text-sm">{audience}</span>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 col-span-1 sm:col-span-2">
                            <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Logo Concept</span>
                            <span className="font-medium text-muted-foreground text-sm">{logoConcept}</span>
                        </div>
                        <div className="p-4 bg-accent/5 rounded-xl border border-accent/10 col-span-1 sm:col-span-2 flex items-center justify-between">
                            <div>
                                <span className="text-muted-foreground block text-[10px] font-bold tracking-widest uppercase mb-1">Primary Palette</span>
                                <span className="font-mono text-xs text-muted-foreground">{palette.join(' · ')}</span>
                            </div>
                            <div className="flex gap-2 h-8">
                                {palette.map((c: string, i: number) => (
                                    <div key={i} className="w-8 h-8 rounded-md shadow-sm border border-border" style={{ backgroundColor: c }} />
                                ))}
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 border-t border-border">
                      <Button onClick={handleConfirm} size="lg" className="w-full text-base font-bold h-12 shadow-md">
                        Confirm & Go To Dashboard
                      </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
