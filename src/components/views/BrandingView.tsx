import React from 'react';
import { motion } from 'motion/react';
import { 
  Palette, Tag, Globe, Zap, CheckCircle2, ArrowUpRight, Search, ChevronRight, Settings2, Plus
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
import { generateBranding, generateMissionStatements, generatePalettes } from '../../services/gemini';
import { db } from '../../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

export default function BrandingView() {
  const { 
    selectedProject, 
    setSelectedProject,
    activeLabTab, 
    setActiveLabTab,
    isBrandingGenerating,
    setIsBrandingGenerating,
    isMissionGenerating,
    setIsMissionGenerating,
    isPaletteGenerating,
    setIsPaletteGenerating,
    customPalette,
    setCustomPalette,
    setPendingBrandingUpdate,
    setIsBrandingConfirmOpen
  } = useStore();

  const handleGenerateBranding = async () => {
    if (!selectedProject) return;
    setIsBrandingGenerating(true);
    try {
      const brandingData = await generateBranding(selectedProject.name, selectedProject.description);
      if (brandingData) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          ...brandingData,
          logoType: selectedProject.branding?.logoType,
          selectedPalette: selectedProject.branding?.selectedPalette
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        setSelectedProject({ ...selectedProject, branding: updatedBranding });
      }
    } catch (error) {
      console.error("Branding generation failed", error);
    } finally {
      setIsBrandingGenerating(false);
    }
  };

  const handleGenerateMissionStatements = async () => {
    if (!selectedProject) return;
    setIsMissionGenerating(true);
    try {
      const missions = await generateMissionStatements(selectedProject.name, selectedProject.description);
      if (missions) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          suggestedMissionStatements: missions
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        setSelectedProject({ ...selectedProject, branding: updatedBranding });
      }
    } catch (error) {
      console.error("Mission generation failed", error);
    } finally {
      setIsMissionGenerating(false);
    }
  };

  const handleGeneratePalettes = async () => {
    if (!selectedProject) return;
    setIsPaletteGenerating(true);
    try {
      const palettes = await generatePalettes(selectedProject.name, selectedProject.description);
      if (palettes) {
        const projectRef = doc(db, 'projects', selectedProject.id);
        const updatedBranding = {
          ...(selectedProject.branding || {}),
          suggestedPalettes: palettes
        };
        await updateDoc(projectRef, { branding: updatedBranding });
        setSelectedProject({ ...selectedProject, branding: updatedBranding });
      }
    } catch (error) {
      console.error("Palette generation failed", error);
    } finally {
      setIsPaletteGenerating(false);
    }
  };

  const initiateBrandingUpdate = (type: 'logo' | 'name' | 'palette' | 'mission', value: any) => {
    setPendingBrandingUpdate({ type, value });
    setIsBrandingConfirmOpen(true);
  };

  const selectLogoType = (type: 'monolith' | 'orbit' | 'prism') => {
    initiateBrandingUpdate('logo', type);
  };

  const selectBrandingName = (name: string) => {
    initiateBrandingUpdate('name', name);
  };

  return (
    <motion.div
      key="branding"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-6xl mx-auto space-y-12"
    >
      <div className="text-center space-y-4 pt-4">
        <h1 className="text-4xl font-bold font-display tracking-tight text-foreground">Identity & Market Lab</h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Forge your brand identity and analyze the competitive landscape with agentic precision.</p>
      </div>

      <Tabs value={activeLabTab} onValueChange={setActiveLabTab} className="w-full relative">
        <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 aetheris-card border-none mb-8 !h-auto p-2 gap-3 shadow-xl">
          <TabsTrigger value="brand" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-4 whitespace-normal text-center h-auto min-h-[56px] rounded-xl transition-all duration-300">
            <Palette size={18} className="mr-2 hidden sm:inline" />
            Brand Identity
          </TabsTrigger>
          <TabsTrigger value="naming" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-4 whitespace-normal text-center h-auto min-h-[56px] rounded-xl transition-all duration-300">
            <Tag size={18} className="mr-2 hidden sm:inline" />
            Name Generator
          </TabsTrigger>
          <TabsTrigger value="market" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-4 whitespace-normal text-center h-auto min-h-[56px] rounded-xl transition-all duration-300">
            <Globe size={18} className="mr-2 hidden sm:inline" />
            Market Research
          </TabsTrigger>
        </TabsList>

        <TabsContent value="brand" className="mt-4 space-y-6">
          <Card className="aetheris-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="text-primary" /> Visual Identity
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleGenerateBranding}
                  disabled={isBrandingGenerating}
                >
                  {isBrandingGenerating ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                  Refresh Identity
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground">AI-driven logo concepts and visual guidelines</CardDescription>
            </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Logo Concepts</h4>
              <div className="grid grid-cols-2 gap-2">
                <div 
                  className={cn(
                    "aspect-square rounded-xl bg-background/50 flex items-center justify-center border transition-all cursor-pointer",
                    selectedProject?.branding?.logoType === 'monolith' ? "border-primary electric-glow" : "border-accent/10 hover:border-primary/50"
                  )}
                  onClick={() => selectLogoType('monolith')}
                >
                  <MonolithLogo 
                    size={40} 
                    logoType="monolith" 
                    primary={selectedProject?.branding?.selectedPalette?.[0]} 
                    secondary={selectedProject?.branding?.selectedPalette?.[1]} 
                    accent={selectedProject?.branding?.selectedPalette?.[2]} 
                  />
                </div>
                <div 
                  className={cn(
                    "aspect-square rounded-xl bg-background/50 flex items-center justify-center border transition-all cursor-pointer",
                    selectedProject?.branding?.logoType === 'orbit' ? "border-primary electric-glow" : "border-accent/10 hover:border-primary/50"
                  )}
                  onClick={() => selectLogoType('orbit')}
                >
                  <OrbitLogo 
                    size={40} 
                    primary={selectedProject?.branding?.selectedPalette?.[0]} 
                    secondary={selectedProject?.branding?.selectedPalette?.[1]} 
                  />
                </div>
                <div 
                  className={cn(
                    "aspect-square rounded-xl bg-background/50 flex items-center justify-center border transition-all cursor-pointer",
                    selectedProject?.branding?.logoType === 'prism' ? "border-primary electric-glow" : "border-accent/10 hover:border-primary/50"
                  )}
                  onClick={() => selectLogoType('prism')}
                >
                  <PrismLogo 
                    size={40} 
                    primary={selectedProject?.branding?.selectedPalette?.[0]} 
                    secondary={selectedProject?.branding?.selectedPalette?.[1]} 
                  />
                </div>
                <div className="aspect-square rounded-xl bg-background/50 flex items-center justify-center border border-dashed border-accent/20 hover:border-primary transition-colors cursor-pointer">
                  <Plus size={24} className="text-muted-foreground" />
                </div>
              </div>
            </div>
            <div className="space-y-4 md:col-span-2">
              <h4 className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Brand Voice & Tone</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-background/30 border border-accent/10">
                  <p className="font-bold text-xs mb-1 text-foreground">Primary Tone</p>
                  <p className="text-sm text-muted-foreground">{selectedProject?.branding?.tone || 'Not generated yet'}</p>
                </div>
                <div className="p-4 rounded-xl bg-background/30 border border-accent/10">
                  <p className="font-bold text-xs mb-1 text-foreground">Target Audience</p>
                  <p className="text-sm text-muted-foreground">{selectedProject?.branding?.targetAudience || 'Not generated yet'}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <p className="font-bold text-xs mb-2 text-primary">Mission Statement</p>
                <p className="text-sm italic text-muted-foreground">"{selectedProject?.branding?.missionStatement || 'Generate branding to see your mission statement.'}"</p>
              </div>
              {selectedProject?.branding?.logoDescription && (
                <div className="p-4 rounded-xl bg-accent/5 border border-accent/20">
                  <p className="font-bold text-xs mb-2 text-accent">Logo Concept</p>
                  <p className="text-xs text-muted-foreground">{selectedProject?.branding?.logoDescription}</p>
                </div>
              )}
            </div>
          </CardContent>
          </Card>

          <Card className="aetheris-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Palette className="text-primary" /> Brand Colors
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleGeneratePalettes}
                  disabled={isPaletteGenerating}
                >
                  {isPaletteGenerating ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                  Generate Palettes
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground">Select a professional color palette or create your own</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {(selectedProject?.branding?.suggestedPalettes || []).length > 0 ? (
                  selectedProject?.branding?.suggestedPalettes?.map((palette, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "p-4 rounded-xl bg-background/30 border cursor-pointer transition-all hover:scale-105",
                        JSON.stringify(selectedProject?.branding?.selectedPalette) === JSON.stringify(palette) ? "border-primary electric-glow" : "border-accent/10"
                      )}
                      onClick={() => initiateBrandingUpdate('palette', palette)}
                    >
                      <div className="flex h-12 rounded-lg overflow-hidden border border-accent/10">
                        {palette.map((color, cIdx) => (
                          <div key={cIdx} className="flex-1" style={{ backgroundColor: color }} />
                        ))}
                      </div>
                      <div className="mt-2 flex justify-between text-[10px] font-mono text-muted-foreground">
                        {palette.map((color, cIdx) => (
                          <span key={cIdx}>{color}</span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center border border-dashed border-accent/20 rounded-xl">
                    <p className="text-sm text-muted-foreground">No palettes generated yet. Click "Generate Palettes" above.</p>
                  </div>
                )}
                
                <div className="p-4 rounded-xl bg-background/30 border border-accent/10 space-y-4">
                  <p className="font-bold text-xs text-foreground flex items-center gap-2">
                    <Settings2 size={12} /> Manual Color Selection
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Primary', index: 0 },
                      { label: 'Secondary', index: 1 },
                      { label: 'Accent', index: 2 }
                    ].map(({ label, index }) => (
                      <div key={index} className="space-y-2">
                        <label className="text-[10px] uppercase text-muted-foreground block text-center">{label}</label>
                        <div 
                          className="h-10 rounded-lg border border-accent/20 cursor-pointer hover:border-primary transition-all flex items-center justify-center overflow-hidden relative group" 
                          style={{ backgroundColor: customPalette[index] }}
                          onClick={() => document.getElementById(`color-picker-${index}`)?.click()}
                        >
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Palette size={14} className="text-white" />
                          </div>
                        </div>
                        <input 
                          id={`color-picker-${index}`}
                          type="color" 
                          className="sr-only"
                          value={customPalette[index]}
                          onChange={(e) => {
                            const newPalette = [...customPalette];
                            newPalette[index] = e.target.value;
                            setCustomPalette(newPalette);
                          }}
                        />
                        <p className="text-[9px] font-mono text-center text-muted-foreground">{customPalette[index].toUpperCase()}</p>
                      </div>
                    ))}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full electric-glow"
                    onClick={() => initiateBrandingUpdate('palette', customPalette)}
                  >
                    Apply Custom Palette
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="aetheris-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="text-primary" /> Mission Statement Lab
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleGenerateMissionStatements}
                  disabled={isMissionGenerating}
                >
                  {isMissionGenerating ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                  Generate Options
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground">Forge a powerful mission statement tailored to your venture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(selectedProject?.branding?.suggestedMissionStatements || []).length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {selectedProject?.branding?.suggestedMissionStatements?.map((mission, idx) => (
                    <div 
                      key={idx}
                      className={cn(
                        "p-4 rounded-xl bg-background/30 border cursor-pointer transition-all group",
                        selectedProject?.branding?.missionStatement === mission ? "border-primary bg-primary/5" : "border-accent/10 hover:border-primary/50"
                      )}
                      onClick={() => initiateBrandingUpdate('mission', mission)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <p className="text-sm italic text-muted-foreground group-hover:text-foreground transition-colors">"{mission}"</p>
                        {selectedProject?.branding?.missionStatement === mission && <CheckCircle2 size={16} className="text-primary shrink-0" />}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-accent/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">No mission statement options generated yet. Click "Generate Options" above.</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="aetheris-card border-none bg-accent/5">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Pro Branding Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Consistency is key. Use the same color palette and typography across all customer touchpoints to build trust and recognition.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="naming" className="mt-4 space-y-6">
          <Card className="aetheris-card border-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tag className="text-primary" /> Name Generator
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-primary/20 text-primary hover:bg-primary/10"
                  onClick={handleGenerateBranding}
                  disabled={isBrandingGenerating}
                >
                  {isBrandingGenerating ? <LoadingIndicator icon={Zap} size={14} className="mr-2" /> : <Zap className="w-3 h-3 mr-2" />}
                  Generate Names
                </Button>
              </CardTitle>
              <CardDescription className="text-muted-foreground">Generate unique, available names for your venture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(selectedProject?.branding?.suggestedNames || []).length > 0 ? (
                  (selectedProject?.branding?.suggestedNames || []).map(name => (
                    <div 
                      key={name} 
                      className={cn(
                        "p-3 rounded-lg bg-background/30 border flex items-center justify-between group transition-colors cursor-pointer",
                        selectedProject?.name === name ? "border-primary bg-primary/5" : "border-accent/10 hover:border-primary/50"
                      )}
                      onClick={() => selectBrandingName(name)}
                    >
                      <span className="font-medium text-foreground">{name}</span>
                      {selectedProject?.name === name ? <CheckCircle2 size={14} className="text-primary" /> : <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-primary transition-opacity" />}
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-8 text-center border border-dashed border-accent/20 rounded-xl">
                    <p className="text-sm text-muted-foreground">No names generated yet. Click "Generate Names" above.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="aetheris-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="text-primary" /> Market Analysis
                </CardTitle>
                <CardDescription className="text-muted-foreground">Real-time competitive landscape scanning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-background/30 border border-accent/10">
                  <h4 className="font-bold mb-2 text-foreground">Niche Saturation Index</h4>
                  <Progress value={35} className="h-2 mb-1 bg-secondary" />
                  <p className="text-[10px] text-muted-foreground">35% Saturation - High Opportunity</p>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Key Competitors</p>
                  <ul className="text-sm space-y-1 text-muted-foreground">
                    <li className="flex items-center gap-2"><ChevronRight size={12} className="text-primary" /> Legacy SaaS Providers</li>
                    <li className="flex items-center gap-2"><ChevronRight size={12} className="text-primary" /> Manual Service Agencies</li>
                    <li className="flex items-center gap-2"><ChevronRight size={12} className="text-primary" /> Early-stage AI Startups</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="aetheris-card border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="text-accent" /> Domain Availability
                </CardTitle>
                <CardDescription className="text-muted-foreground">Check URL availability for your brand</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-accent/10">
                    <span className="text-sm font-mono text-muted-foreground">aetherisventures.io</span>
                    <Badge className="bg-primary/20 text-primary">Available</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded bg-background/50 border border-accent/10">
                    <span className="text-sm font-mono text-muted-foreground">aetheris-ventures.com</span>
                    <Badge variant="outline" className="text-destructive border-destructive/30">Taken</Badge>
                  </div>
                </div>
                <Button variant="outline" className="w-full border-primary/30 text-primary hover:bg-primary/10">
                  Check More Domains
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
