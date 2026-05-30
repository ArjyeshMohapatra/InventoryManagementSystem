import { Component, inject, signal, computed, effect, input } from '@angular/core';
import { ProductQueryService } from '../../queryService/product.query.service';
import { CategoryQueryService } from '../../../categories/queryService/category.query.service';
import { RouterLink } from '@angular/router';
import { SearchInput, SelectInput, Table, Modal } from '../../../../shared/ui';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, SearchInput, SelectInput, Table, Modal],
  templateUrl: './product-list.html'
})
export class ProductList {

  columns = [
    'name',
    'price',
    'quantity',
    'category'
  ];

  actions = true;

  private productQueryService = inject(ProductQueryService);
  private categoryQueryService = inject(CategoryQueryService);

  productsQuery = this.productQueryService.getProductsQuery();
  categoriesQuery = this.categoryQueryService.getCategoriesQuery();

  searchTerm = signal(''); // debounced value
  searchInput = signal(''); // immediate typing
  selectedCategory = signal('');

  selectedProduct = signal<Product | null>(null);
  showDeleteModal = signal(false);

  deleteMutation = this.productQueryService.deleteProductMutation();


  constructor() {
    effect((onCleanup) => {
      const value = this.searchInput();
      const timer = setTimeout(() => { this.searchTerm.set(value) }, 300);
      onCleanup(() => { clearTimeout(timer) });
    });
  }

  categoryMap = computed(() => {
    const categories = this.categoriesQuery.data() ?? [];
    return Object.fromEntries(categories.map(category => [
      category.id,
      category.name
    ]));
  });

  filteredProducts = computed(() => {
    const products = this.productsQuery.data() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    return products.filter(product => {
      const matchesSearch = !term || product.name.toLowerCase().trim().includes(term);
      const matchesCategory = !category || product.category === category;

      return (matchesSearch && matchesCategory);
    }).map(product => ({ ...product, category: this.categoryMap()[product.category] ?? 'Unknown' }));
  });

  categories = computed(() => {
    const categories = this.categoriesQuery.data() ?? [];
    return categories.map(category => ({
      label: category.name,
      value: category.id

    }));
  });

  openDeleteModal(product: Product) { 
    this.selectedProduct.set(product);
    this.showDeleteModal.set(true); 
  }
  closeDeleteModal() { 
    this.showDeleteModal.set(false);
    this.selectedProduct.set(null);
  }
  deleteProduct() {
    const product = this.selectedProduct();
    if (product) {
      this.deleteMutation.mutate(product.id, {
        onSuccess: () => {
          this.closeDeleteModal();
        }
      });
    }
  }
}