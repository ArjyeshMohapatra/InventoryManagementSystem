import { Component, inject, signal, computed, effect } from '@angular/core';
import { ProductQueryService } from '../../queryService/product.query.service';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink, SearchInput],
  templateUrl: './product-list.html'
})
export class ProductList {
  private productQueryService = inject(ProductQueryService);
  productsQuery = this.productQueryService.getProductsQuery();

  searchTerm = signal(''); // debounced value
  searchInput = signal(''); // immediate typing

  constructor() {
    effect((onCleanup) => {
      const value = this.searchInput();
      const timer = setTimeout(() => { this.searchTerm.set(value) }, 300);
      onCleanup(() => { clearTimeout(timer) });
    });
  }
  filteredProducts = computed(() => {
    const products = this.productsQuery.data() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return products;
    return products.filter(product => product.name.toLocaleLowerCase().includes(term));
  });
}