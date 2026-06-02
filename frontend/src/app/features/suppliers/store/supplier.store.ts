import { Injectable, inject, signal } from '@angular/core';
import { finalize, retry } from 'rxjs';

import { Supplier } from '../models/supplier.model';
import { SupplierRepository } from '../../../core/api/repositories/supplier.repository';
import { CacheStore } from '../../../shared/store/cache.store';
import { ProductStore } from '../../products/store/product.store';

@Injectable({
  providedIn: 'root',
})
export class SupplierStore extends CacheStore {
  private suppRepo = inject(SupplierRepository);
  private prodStore = inject(ProductStore);

  suppliers = signal<Supplier[]>([]);
  selectedSupplier = signal<Supplier | null>(null);

  loadSuppliers(force = false) {
    const hasSuppliers = this.suppliers().length > 0;

    if (!force && this.isCacheValid(hasSuppliers)) return;
    if (this.fetching()) return;

    if (this.suppliers().length) {
      this.refreshing.set(true);
    } else {
      this.loading.set(true);
    }

    this.error.set(null);
    this.fetching.set(true);

    this.suppRepo.getSuppliers().pipe(
        retry({
          count: this.retryCount,
          delay: this.retryDelay,
        }),
        finalize(() => {
          this.loading.set(false);
          this.refreshing.set(false);
          this.fetching.set(false);
        })
      ).subscribe({
        next: (suppliers) => {
          this.suppliers.set(suppliers);
          this.lastLoaded.set(Date.now());
        },
        error: () => {
          this.error.set('Failed to load suppliers');
        },
      });
  }

  loadSupplierById(id: string) {
    this.loading.set(true);
    this.error.set(null);

    this.suppRepo.getSupplierById(id).subscribe({
      next: (supplier) => {
        this.selectedSupplier.set(supplier);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Failed to load supplier');
        this.loading.set(false);
      },
    });
  }

  addSupplier(supplier: Supplier, onSuccess?: () => void) {
    this.loading.set(true);

    const suppliers = this.suppliers();
    const nextNumber = suppliers.length ? Math.max(...suppliers.map(supplier => Number(supplier.id.replace('SUP', '') + 1))) : 1;
    const supplierId = `SUP${String(nextNumber).padStart(3, '0')}`;

    this.suppRepo.addSupplier({...supplier, id: supplierId}).pipe(
        finalize(() => {
          this.loading.set(false);
        })
      ).subscribe({
        next: (created) => {
          this.suppliers.update((suppliers) => [...suppliers, created]);
          onSuccess?.();
        },
        error: () => {
          this.error.set('Failed to add supplier');
        },
      });
  }

  updateSupplier(supplier: Supplier, onSuccess?: () => void) {
    this.loading.set(true);

    this.suppRepo.updateSupplier(supplier).pipe(
        finalize(() => {
          this.loading.set(false);
        })
      ).subscribe({
        next: (updated) => {
          this.suppliers.update((suppliers) =>
            suppliers.map((existing) =>
              existing.id === updated.id ? updated : existing
            )
          );
          onSuccess?.();
        },
        error: () => {
          this.error.set('Failed to update supplier');
        },
      });
  }

  deleteSupplier(id: string, onSuccess?: () => void) {
    this.loading.set(true);

    this.suppRepo.deleteSupplier(id).pipe(
        finalize(() => {
          this.loading.set(false);
        })
      ).subscribe({
        next: () => {
          this.suppliers.update((suppliers) => suppliers.filter((supplier) => supplier.id !== id));
          onSuccess?.();
        },
        error: () => {
          this.error.set('Failed to delete supplier');
        },
      });
  }

  deleteSupplierWithProducts(supplierId: string, onSuccess?: () => void) {
    this.loading.set(true);
    this.suppRepo.deleteSupplierWithProducts(supplierId).pipe(
        finalize(() => {
          this.loading.set(false);
        })
      ).subscribe({
        next: () => {
            this.suppliers.update(suppliers => suppliers.filter(supplier => supplier.id !== supplierId));
            this.prodStore.loadProducts();
            onSuccess?.();
        },
        error: () => {
            this.error.set('Failed to delete supplier');
        }
        });
    }
}