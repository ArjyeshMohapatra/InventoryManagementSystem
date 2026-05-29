import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../../features/products/models/product.model';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductRepository {

  private http = inject(HttpClient);

  private productsApi = `${environment.apiUrl}/products`;

    getProductsByCategory(categoryId: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.productsApi}?category=${categoryId}`);
    }
    
    addProductByCategory(product: Product): Observable<Product> {
        return this.http.post<Product>(this.productsApi, product);
    }
    
    updateProductByCategory(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.productsApi}/${product.id}`, product);
    }

    getProductByIdByCategory(id: string): Observable<Product> {
        return this.http.get<Product>(`${this.productsApi}/${id}`);
    }

    deleteProductByCategory(id: string) {
        return this.http.delete(`${this.productsApi}/${id}`);
      }

}