import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { BlogService } from '../../services/blog.service';
import { Article } from '../../models/models';

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
  private readonly sanitizer = inject(DomSanitizer);
  private readonly cdr = inject(ChangeDetectorRef);

  article: Article | null = null;
  safeContent: SafeHtml | null = null;
  isLoading = true;
  errorMsg = '';

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadArticle(slug);
    } else {
      this.errorMsg = 'Invalid Article Slug';
      this.isLoading = false;
    }
  }

  private loadArticle(slug: string): void {
    this.blogService.getArticleBySlug(slug).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.article = response.data;
          this.safeContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content);
        } else {
          this.errorMsg = response.message || 'Article not found';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.errorMsg = 'Failed to retrieve article details.';
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  resolveImageUrl(url: string | undefined): string {
    if (!url) return 'images/blog_fallback.jpg';
    return url;
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
