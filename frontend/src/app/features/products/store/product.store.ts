import { Injectable, signal, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductRepository } from '../../../core/api/repositories/product.repository';

@Injectable({
    providedIn: 'root'
  })
  export class ProductStore {
  
    private repo = inject(ProductRepository);
  
    products = signal<Product[]>([]);
  
    loading = signal(false);
  
    loadProducts() {
      this.loading.set(true);
  
      this.repo.getProducts()
        .subscribe(res => {

          this.products.set(res);
  
          this.loading.set(false);
  
        });
    }

    addProduct(product: Product) {
        this.repo.addProduct(product)
          .subscribe(() => {
      
            this.loadProducts();
      
          });
    }
    
    updateProduct(product: Product) {
        this.repo.updateProduct(product)
          .subscribe(() => {
      
            this.loadProducts();
      
          });
    }
    
    deleteProduct(id: number) {
        return this.repo.deleteProduct(id)
        .subscribe(() => {
      
            this.loadProducts();
      
          });
      }
  }