import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { Category } from '../../../features/categories/models/category.model';
import { ProductRepository } from './product.repository';

@Injectable({
  providedIn: 'root'
})
export class CategoryRepository {

  private http = inject(HttpClient);
  private productRepo = inject(ProductRepository);

  private categoriesApi = `${environment.apiUrl}/categories`;

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(this.categoriesApi);
  }

  getCategoryById(id: string): Observable<Category> {
    return this.http.get<Category>(`${this.categoriesApi}/${id}`);
  }

  addCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(this.categoriesApi, category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.categoriesApi}/${category.id}`, category);
  }

  deleteCategory(id: string) {
    return this.http.delete(`${this.categoriesApi}/${id}`);
  }

  deleteCategoryWithProducts(categoryId: string) {
    return this.productRepo.getProductsByCategory(categoryId).pipe(
      switchMap(products => {
        const deletes = products.map(product => this.productRepo.deleteProduct(product.id));
        return forkJoin(deletes);
      }),
      switchMap(() => this.deleteCategory(categoryId))
    );
  }

}