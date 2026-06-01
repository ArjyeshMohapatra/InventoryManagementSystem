import { Component, inject, signal, computed, effect, input } from '@angular/core';
import { ProductStore } from '../../store/product.store';
import { CategoryStore } from 'src/app/features/categories/store/category.store';
import { RouterLink } from '@angular/router';
import { SearchInput, SelectInput, Table, Modal } from '../../../../shared/ui';
import { Product } from '../../models/product.model';
import { CdkDragDrop } from '@angular/cdk/drag-drop';

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

  private productStore = inject(ProductStore);
  private categoryStore = inject(CategoryStore);

  prodStore = this.productStore;
  catStore = this.categoryStore;

  searchTerm = signal(''); // debounced value
  searchInput = signal(''); // immediate typing
  selectedCategory = signal('');

  selectedProduct = signal<Product | null>(null);
  showDeleteModal = signal(false);

  constructor() {
    effect((onCleanup) => {
      const value = this.searchInput();
      const timer = setTimeout(() => { this.searchTerm.set(value) }, 300);
      onCleanup(() => { clearTimeout(timer) });
    });
    this.prodStore.loadProducts();
    this.catStore.loadCategories(); // Added this
  }

  categoryMap = computed(() => {
    const categories = this.catStore.categories();
    return Object.fromEntries(categories.map(category => [
      category.id,
      category.name
    ]));
  });

  filteredProducts = computed(() => {
    const products = this.prodStore.products();
    const term = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    return products.filter(product => {
      const matchesSearch = !term || product.name.toLowerCase().trim().includes(term);
      const matchesCategory = !category || product.category === category;

      return (matchesSearch && matchesCategory);
    }).map(product => ({ ...product, category: this.categoryMap()[product.category] ?? 'Unknown' }));
  });

  categories = computed(() => {
    const categories = this.catStore.categories();
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
      this.prodStore.deleteProduct(product.id, () => {
          this.closeDeleteModal();
        }
      );
    }
  }

  swapProducts(event: CdkDragDrop<any[]>) {
    const previous = event.previousIndex;
    const current = event.currentIndex;
  
    if (previous === current) return;
  
    const filtered = this.filteredProducts();
    const sourceDisplay = filtered[previous];
    const targetDisplay = filtered[current];
  
    // Find the original raw objects from the store using their IDs
    const allProducts = this.prodStore.products();
    const source = allProducts.find(p => p.id === sourceDisplay.id);
    const target = allProducts.find(p => p.id === targetDisplay.id);

    if (!source || !target) return;
  
    const sourceOrder = source.order;
    const targetOrder = target.order;
  
    // Update using the original objects to preserve the category IDs
    this.prodStore.updateProduct({...source, order: targetOrder});
    this.prodStore.updateProduct({...target, order: sourceOrder});
  }
}