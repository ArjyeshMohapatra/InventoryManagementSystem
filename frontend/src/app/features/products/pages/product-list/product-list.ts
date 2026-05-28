import { Component, inject, signal, computed, effect } from '@angular/core';
import { ProductQueryService } from '../../queryService/product.query.service';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { SelectInput } from '../../../../shared/ui/select-input/select-input';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink, SearchInput, SelectInput],
  templateUrl: './product-list.html'
})
export class ProductList {
  private productQueryService = inject(ProductQueryService);
  productsQuery = this.productQueryService.getProductsQuery();

  searchTerm = signal(''); // debounced value
  searchInput = signal(''); // immediate typing
  selectedCategory = signal('');

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
    const category = this.selectedCategory();

    return products.filter(product => {
      const matchesSearch = !term || product.name.toLowerCase().trim();
      const matchesCategory = !category || product.category === category;

      return (matchesSearch && matchesCategory);
    });
  });

  categories = computed(() => {
    const products = this.productsQuery.data() ?? [];
    return [...new Set(products.map(product => product.category))].sort()
  });
}