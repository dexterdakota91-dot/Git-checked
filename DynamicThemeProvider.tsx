import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * Applies project branding colors as CSS custom properties on the document root when applicable.
 *
 * When the current active tab is not one of 'idea-lab', 'glossary', or 'legal', and the selected project
 * provides a palette with at least three colors, sets `--color-primary`, `--color-secondary`, and `--color-accent`
 * to the first three palette entries. Otherwise removes those CSS variables to revert to system defaults.
 *
 * @param children - React nodes to render within the provider
 * @returns A React fragment containing `children`
 */
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
