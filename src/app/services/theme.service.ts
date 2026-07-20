import { Injectable, signal } from '@angular/core';

export interface ThemeConfig {
  primaryRed: string;
  secondaryOrange: string;
  black: string;
  bgLight: string;
  bgSection: string;
  textMain: string;
  textMuted: string;
  borderLight: string;
}

export const DEFAULT_THEME: ThemeConfig = {
  primaryRed: '#e60000',
  secondaryOrange: '#ff6600',
  black: '#111111',
  bgLight: '#ffffff',
  bgSection: '#f8f9fa',
  textMain: '#111111',
  textMuted: '#555555',
  borderLight: '#e5e7eb'
};

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  readonly currentTheme = signal<ThemeConfig>(DEFAULT_THEME);

  constructor() {
    this.applyThemeToDom(this.currentTheme());
  }

  setTheme(config: Partial<ThemeConfig>): void {
    const updated = { ...this.currentTheme(), ...config };
    this.currentTheme.set(updated);
    this.applyThemeToDom(updated);
  }

  setPrimaryColor(color: string): void {
    this.setTheme({ primaryRed: color });
  }

  resetToDefault(): void {
    this.currentTheme.set(DEFAULT_THEME);
    this.applyThemeToDom(DEFAULT_THEME);
  }

  private applyThemeToDom(theme: ThemeConfig): void {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.style.setProperty('--theme-primary-red', theme.primaryRed);
    root.style.setProperty('--theme-secondary-orange', theme.secondaryOrange);
    root.style.setProperty('--theme-black', theme.black);
    root.style.setProperty('--theme-bg-light', theme.bgLight);
    root.style.setProperty('--theme-bg-section', theme.bgSection);
    root.style.setProperty('--theme-text-main', theme.textMain);
    root.style.setProperty('--theme-text-muted', theme.textMuted);
    root.style.setProperty('--theme-border-light', theme.borderLight);
  }
}
