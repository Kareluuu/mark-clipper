import { ThemeKey, getThemeConfig } from './themeConfig';

export const applyTheme = (k: ThemeKey, el?: HTMLElement) => {
  const cfg = getThemeConfig(k);
  const root = el ?? document.documentElement;
  Object.entries(cfg.cssVariables).forEach(([key, val]) =>
    root.style.setProperty(key, val)
  );
}; 