import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/models';
import { resolveImageUrl } from '../../utils/image.utils';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  resolveImageUrl(urls: string[] | undefined): string {
    const firstUrl = urls && urls.length > 0 ? urls[0] : undefined;
    return resolveImageUrl(firstUrl, 'images/product_fallback.jpg');
  }

  isOutOfStock(): boolean {
    return this.product.stockQuantity <= 0;
  }
}
