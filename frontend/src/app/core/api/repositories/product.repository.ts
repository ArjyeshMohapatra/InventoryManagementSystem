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

    getProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(this.productsApi);
    }
    
    addProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(this.productsApi, product);
    }
    
    updateProduct(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.productsApi}/${product.id}`, product);
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.productsApi}/${id}`);
    }

    deleteProduct(id: number) {
        return this.http.delete(`${this.productsApi}/${id}`);
      }

}