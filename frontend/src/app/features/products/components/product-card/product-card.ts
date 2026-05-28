import { Component, input, inject } from '@angular/core';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { ProductStore } from '../../store/product.store';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  private store = inject(ProductStore);
  product = input.required<Product>();

  deleteProduct() {
    this.store.deleteProduct(this.product().id)
    this.store.loadProducts();
  }
}