export type ThemeKey = 'Olivine' | 'Jasmine' | 'Maya_blue' | 'Eggshell';

export interface ThemeConfig {
  key: ThemeKey;              // clips.theme_name 对应
  displayName: string;        // UI 展示
  colorPrimary: string;       // 主色，用于按钮/边框等
  cssVariables: Record<string, string>; // 需要覆盖的 CSS 变量
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  Olivine: {
    key: 'Olivine',
    displayName: 'Olivine',
    colorPrimary: '#b1cd93',
    cssVariables: { '--theme-primary': '#b1cd93' }
  },
  Jasmine: {
    key: 'Jasmine',
    displayName: 'Jasmine',
    colorPrimary: '#f8d584',
    cssVariables: { '--theme-primary': '#f8d584' }
  },
  Maya_blue: {
    key: 'Maya_blue',
    displayName: 'Maya blue',
    colorPrimary: '#7fbce5',
    cssVariables: { '--theme-primary': '#7fbce5' }
  },
  Eggshell: {
    key: 'Eggshell',
    displayName: 'Eggshell',
    colorPrimary: '#f0e8d4',
    cssVariables: { '--theme-primary': '#f0e8d4' }
  }
};

export const DEFAULT_THEME: ThemeKey = 'Olivine';
export const getThemeConfig = (k: ThemeKey) =>
  THEMES[k] ?? THEMES[DEFAULT_THEME]; 