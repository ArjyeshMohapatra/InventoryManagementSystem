import { Component, input, inject } from '@angular/core';
import { Product } from '../../models/product.model';
import { RouterLink } from '@angular/router';
import { ProductQueryService } from '../../queryService/product.query.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  private productQueryService = inject(ProductQueryService);
  product = input.required<Product>();

  deleteMutation = this.productQueryService.deleteProductMutation();

  deleteProduct() {
    this.deleteMutation.mutate(this.product().id)
  }
}