import { Component, inject } from '@angular/core';
import { ProductQueryService } from '../../queryService/product.query.service';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './product-list.html'
})
export class ProductList {
  private productQueryService = inject(ProductQueryService);
  productsQuery = this.productQueryService.getProductsQuery();
}