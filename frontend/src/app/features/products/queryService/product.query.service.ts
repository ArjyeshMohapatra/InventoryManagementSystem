import { Injectable, inject } from '@angular/core';
import { Product } from '../models/product.model';
import { ProductRepository } from '../../../core/api/repositories/product.repository';
import { injectQuery, injectMutation, QueryClient } from '@tanstack/angular-query-experimental';
import { firstValueFrom } from 'rxjs';

@Injectable({
    providedIn: 'root'
  })
export class ProductQueryService {
  
  private repo = inject(ProductRepository);
  private queryClient = inject(QueryClient);
  
  getProductsQuery() {
    return injectQuery(() => ({
      queryKey: ['products'],
      queryFn: () => firstValueFrom(this.repo.getProducts()),
      staleTime: 1000 * 60 * 2,
    }));
  }

  getProductsByCategoryQuery(categoryId: () => string) {
    return injectQuery(() => ({
      queryKey: ['products', 'category', categoryId()],
      queryFn: () => firstValueFrom(this.repo.getProductsByCategory(categoryId())),
      staleTime: 1000 * 60 * 2,
    }));
  }

  getProductQuery(id: () => string) {
    return injectQuery(() => ({
      queryKey: ['products', id()],
      queryFn: () => firstValueFrom(this.repo.getProductById(id())),
      staleTime: 1000 * 60 * 5,
    }));
  }

  addProductMutation() {
    return injectMutation(() => ({
      mutationFn: (product: Product) => firstValueFrom(this.repo.addProduct(product)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'], exact: false, refetchType: 'active' });
      },
      onError: (err) => {
        console.error(err);
      }
    }));
  }

  updateProductMutation() {
    return injectMutation(() => ({
      mutationFn: (product: Product) => firstValueFrom(this.repo.updateProduct(product)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'], exact: false, refetchType: 'active' });
      },
      onError: (err) => {
        console.error(err);
      }
    }));
  }

  deleteProductMutation() {
    return injectMutation(() => ({
      mutationFn: (id: string) => firstValueFrom(this.repo.deleteProduct(id)),
      onSuccess: () => {
        this.queryClient.invalidateQueries({ queryKey: ['products'], exact: false, refetchType: 'active' });
      },
      onError: (err) => {
        console.error(err);
      }
    }));
  }
}