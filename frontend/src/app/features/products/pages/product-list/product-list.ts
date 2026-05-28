import { Component, inject, signal, computed, effect, input } from '@angular/core';
import { ProductQueryService } from '../../queryService/product.query.service';
import { RouterLink } from '@angular/router';
import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { SelectInput } from '../../../../shared/ui/select-input/select-input';
import { Table } from '../../../../shared/ui/table/table';
import { Modal } from '../../../../shared/ui/modal/modal';
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
  productsQuery = this.productQueryService.getProductsQuery();

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
  filteredProducts = computed(() => {
    const products = this.productsQuery.data() ?? [];
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    return products.filter(product => {
      const matchesSearch = !term || product.name.toLowerCase().trim().includes(term);
      const matchesCategory = !category || product.category === category;

      return (matchesSearch && matchesCategory);
    });
  });

  categories = computed(() => {
    const products = this.productsQuery.data() ?? [];
    return [...new Set(products.map(product => product.category))].sort()
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