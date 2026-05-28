import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductRepository } from '../../../core/api/repositories/product.repository';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { lastValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class ProductQueryService {
  
  private repo = inject(ProductRepository);
  private queryClient = inject(QueryClient);
  
  getProductsQuery() {
    return injectQuery(() => ({
      queryKey: ['products'],
      queryFn: () => lastValueFrom(this.repo.getProducts()),
      staleTime: 1000 * 60 * 2,
    }));
  }

  getProductQuery(id: () => number) {
    return injectQuery(() => ({
      queryKey: ['products', id()],
      queryFn: () => lastValueFrom(this.repo.getProductById(id())),
      staleTime: 1000 * 60 * 5, // Keep fresh for 5 minutes
    }));
  }

  addProductMutation() {
    return injectMutation(() => ({
      mutationFn: (product: Product) => lastValueFrom(this.repo.addProduct(product)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }));
  }

  updateProductMutation() {
    return injectMutation(() => ({
      mutationFn: (product: Product) => lastValueFrom(this.repo.updateProduct(product)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }));
  }

  deleteProductMutation() {
    return injectMutation(() => ({
      mutationFn: (id: number) => lastValueFrom(this.repo.deleteProduct(id)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'] });
      }
    }));
  }
}