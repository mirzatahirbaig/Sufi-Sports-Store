import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../services/blog.service';
import { SeoService } from '../../services/seo.service';
import { Article } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './blog-detail.html',
  styleUrl: './blog-detail.scss'
})
export class BlogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly blogService = inject(BlogService);
  private readonly seoService = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  article: Article | null = null;
  safeContent: SafeHtml | null = null;
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) this.loadArticle(slug);
    else { this.errorMsg = 'Invalid Article Slug'; this.isLoading = false; }
  }

  private loadArticle(slug: string): void {
    this.blogService.getArticleBySlug(slug).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.article = response.data;
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
          this.applyArticleSeo(this.article);
        } else this.errorMsg = response.message || 'Article not found';
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => { this.errorMsg = 'Failed to retrieve article details.'; this.isLoading = false; this.cdr.markForCheck(); }
    });
  }

  private applyArticleSeo(article: Article): void {
    const excerpt = (article.content || '').replace(/<[^>]*>?/gm, '').slice(0, 160);
    const cover = this.resolveImageUrl(article.coverImageUrl);

    this.seoService.updateSeo({
      title: `${article.title} | Sufi Sports Blog`,
      description: excerpt,
      keywords: `boxing gear guide, ${article.title.toLowerCase()}, boxing training, sufi sports blog`,
      ogImage: cover,
      type: 'article'
    });

    this.seoService.setJsonLdSchema({
      '@context': 'https://schema.org',
      '@type': 'BlogPosting',
      'headline': article.title,
      'description': excerpt,
      'image': cover,
      'author': { '@type': 'Organization', 'name': article.author || 'Sufi Sports' },
      'publisher': { '@type': 'Organization', 'name': 'Sufi Sports', 'logo': { '@type': 'ImageObject', 'url': 'https://sufisports.com/logo.png' } },
      'datePublished': article.publishedDate
    });
  }

  resolveImageUrl(url: string | undefined): string { return resolveImageUrl(url, 'images/blog_fallback.jpg'); }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }
}
