import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { selectedProject, activeTab } = useStore();

  useEffect(() => {
    const root = document.documentElement;
    // Excluded pages where system default branding should show instead of venture branding
    const excludedPages = ['idea-lab', 'glossary', 'legal'];
    const isExcluded = excludedPages.includes(activeTab);

    // Grab palette 
    // Fallback order: Explicitly selected palette -> project colors -> default system theme
    const palette = selectedProject?.branding?.selectedPalette;

    if (!isExcluded && palette && palette.length >= 3) {
      // Hex to RGB conversion for any alpha usages (shadcn uses hsl, but we can set tailwind vars directly)
      root.style.setProperty('--color-primary', palette[0]);
      root.style.setProperty('--color-secondary', palette[1]);
      root.style.setProperty('--color-accent', palette[2]);
      
      // Attempt to modify CSS Variables that Tailwind V4 uses natively:
      // Typically if you set root styles matching theme override it overrides the theme.
    } else {
      // Revert to default System Colors defined in index.css
      root.style.removeProperty('--color-primary');
      root.style.removeProperty('--color-secondary');
      root.style.removeProperty('--color-accent');
    }
  }, [activeTab, selectedProject]);

  return <>{children}</>;
}
