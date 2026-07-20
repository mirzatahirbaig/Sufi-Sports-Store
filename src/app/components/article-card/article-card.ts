import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './article-card.html',
  styleUrl: './article-card.scss'
})
export class ArticleCardComponent {
  @Input({ required: true }) article!: Article;

  resolveImageUrl(url: string | undefined): string {
    return resolveImageUrl(url, 'images/blog_fallback.jpg');
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getSnippet(htmlContent: string): string {
    if (!htmlContent) return '';
    // Strip HTML tags using regex
    const tempText = htmlContent.replace(/<[^>]*>/g, '');
    return tempText.length > 120 ? tempText.substring(0, 120) + '...' : tempText;
  }
}
