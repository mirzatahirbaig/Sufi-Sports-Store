import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/models';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  resolveImageUrl(urls: string[]): string {
    if (!urls || urls.length === 0 || !urls[0]) {
      return 'images/product_fallback.jpg';
    }
    return urls[0];
  }

  isOutOfStock(): boolean {
    return this.product.stockQuantity <= 0;
  }
}
