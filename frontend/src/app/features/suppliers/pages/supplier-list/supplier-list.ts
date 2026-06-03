import { Component, computed, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SearchInput } from '../../../../shared/ui/search-input/search-input';
import { Table } from '../../../../shared/ui/table/table';
import { Modal } from '../../../../shared/ui/modal/modal';

import { SupplierStore } from '../../store/supplier.store';
import { ProductStore } from 'src/app/features/products/store/product.store';
import { Supplier } from '../../models/supplier.model';
import { CategoryStore } from 'src/app/features/categories/store/category.store';
import { FontAwesomeModule, FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faHistory, faEdit, faDumpster } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [RouterLink, SearchInput, Table, Modal, FontAwesomeModule],
  templateUrl: './supplier-list.html',
})
export class SupplierList {
  private supplierStore = inject(SupplierStore);
  private productStore = inject(ProductStore);
  private categoryStore = inject(CategoryStore);

  suppStore = this.supplierStore;
  prodStore = this.productStore;
  catStore = this.categoryStore;

  searchInput = signal('');
  searchTerm = signal('');

  columns = [
    'id',
    'name',
    'company',
    'contactPerson',
    'contactPersonGender',
    'email',
    'phone',
    'website',
    'gstNumber',
    'stock',
    'linkedCategories'
  ];

  actions = true;

  selectedSupplier = signal<Supplier | null>(null);
  showDeleteModal = signal(false);
  deleteMessage = signal('');

  history = faHistory;
  edit = faEdit;
  remove = faDumpster;

  constructor() {
    this.suppStore.loadSuppliers();
    this.prodStore.loadProducts();

    effect((onCleanup) => {
      const value = this.searchInput();

      const timer = setTimeout(() => {
        this.searchTerm.set(value);
      }, 300);

      onCleanup(() => {
        clearTimeout(timer);
      });
    });
  }

  supplierQuantityMap = computed(() => {
    const products = this.prodStore.products();
    const totals: Record<string, number> = {};
    products.forEach(product => { totals[product.supplierId] = (totals[product.supplierId] || 0) + product.stock });
    return totals;
  });

  supplierCategoryMap = computed(() => {
    const products = this.prodStore.products() || [];
    const categories = this.catStore.categories() || [];

    if (categories.length === 0) return {};

    const categoryLookup = categories.reduce((acc, cat) => {
      acc[cat.id] = cat.name;
      return acc;
    }, {} as Record<string, string>);

    const linked: Record<string, Set<string>> = {};
  
    products.forEach(product => {
      if (!linked[product.supplierId]) {
        linked[product.supplierId] = new Set();
      }
      if (product.category) {
          const categoryName = categoryLookup[product.category] || 'Unknown Category';
          linked[product.supplierId].add(categoryName);
      }
    });
  
    // Convert Sets to a comma-separated string for display
    const result: Record<string, string> = {};
    for (const supplierId in linked) {
      result[supplierId] = Array.from(linked[supplierId]).join(', ');
    }
  
    return result;
  });

  filteredSuppliers = computed(() => {
    const suppliers = this.suppStore.suppliers();
    const term = this.searchTerm().toLowerCase().trim();

    return suppliers.filter(
      (supplier) => !term || supplier.name.toLowerCase().includes(term)
    ).map(supplier => ({ ...supplier, stock: this.supplierQuantityMap()[supplier.id] ?? 0, linkedCategories : this.supplierCategoryMap()[supplier.id] ?? '' }));
  });

  openDeleteModal(supplier: Supplier) {
    this.selectedSupplier.set(supplier);
    const products = this.getSupplierProducts(supplier.id);
    const count = products.length;
    this.deleteMessage.set(
      count > 0 ? 
        `${supplier.name} Contains ${count} Linked Products. Deleting This SUpplier Will Also Remove Those Products.`
        : `This action can't be undone, still want to delete Supplier ${supplier.name}?`
    );
    this.showDeleteModal.set(true);
  }

  closeDeleteModal() {
    this.showDeleteModal.set(false);
    this.selectedSupplier.set(null);
  }

  deleteSupplier() {
    const supplier = this.selectedSupplier();

    if (!supplier) return;

    const linkedProducts = this.getSupplierProducts(supplier.id);

    if (linkedProducts.length) {
      this.suppStore.deleteSupplierWithProducts(supplier.id, () => {
            this.closeDeleteModal();
          });
    } else {
      this.suppStore.deleteSupplier(supplier.id, () => {
            this.closeDeleteModal();
          });
    }
  }

  getSupplierProducts(supplierId: string) {
    return this.prodStore.products().filter(
        product =>
          product.supplierId === supplierId
      );
  }
}