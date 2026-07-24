import { inject, Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoConfig {
  title: string;
  description: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  type?: string;
}

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  updateSeo(config: SeoConfig): void {
    const fullTitle = config.title.includes('Sufi Sports') ? config.title : `${config.title} | Sufi Sports USA`;
    this.titleService.setTitle(fullTitle);
    this.updateBasicMeta(config.description, config.keywords);
    this.updateOpenGraph(fullTitle, config);
    this.updateCanonical(config.canonicalUrl);
  }

  private updateBasicMeta(desc: string, keywords?: string): void {
    this.metaService.updateTag({ name: 'description', content: desc });
    if (keywords) this.metaService.updateTag({ name: 'keywords', content: keywords });
    this.metaService.updateTag({ name: 'robots', content: 'index, follow' });
    this.metaService.updateTag({ name: 'geo.region', content: 'US' });
    this.metaService.updateTag({ name: 'geo.placename', content: 'United States' });
  }

  private updateOpenGraph(title: string, config: SeoConfig): void {
    const img = config.ogImage || '/images/hero_boxing.png';
    const type = config.type || 'website';
    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: config.description });
    this.metaService.updateTag({ property: 'og:image', content: img });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: config.description });
    this.metaService.updateTag({ name: 'twitter:image', content: img });
  }

  private updateCanonical(url?: string): void {
    const targetUrl = url || this.doc.location.href;
    let link: HTMLLinkElement | null = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', targetUrl);
  }

  setJsonLdSchema(schemaObj: object): void {
    const existing = this.doc.querySelector('script[type="application/ld+json"]');
    if (existing) existing.remove();
    const script = this.doc.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(schemaObj);
    this.doc.head.appendChild(script);
  }
}
