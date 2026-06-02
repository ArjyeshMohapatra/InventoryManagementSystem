import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap, forkJoin } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier } from '../../../features/suppliers/models/supplier.model';
import { ProductRepository } from './product.repository';

@Injectable({
  providedIn: 'root',
})
export class SupplierRepository {
  private http = inject(HttpClient);
  private productRepository = inject(ProductRepository);

  productRepo = this.productRepository;

  private suppliersApi = `${environment.apiUrl}/suppliers`;

  getSuppliers(): Observable<Supplier[]> {
    return this.http.get<Supplier[]>(this.suppliersApi);
  }

  getSupplierById(id: string): Observable<Supplier> {
    return this.http.get<Supplier>(`${this.suppliersApi}/${id}`);
  }

  addSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.post<Supplier>(this.suppliersApi, supplier);
  }

  updateSupplier(supplier: Supplier): Observable<Supplier> {
    return this.http.put<Supplier>(`${this.suppliersApi}/${supplier.id}`, supplier);
  }

  deleteSupplier(supplierId: string) {
    return this.http.delete(`${this.suppliersApi}/${supplierId}`);
  }

  deleteSupplierWithProducts(supplierId: string) {
      return this.productRepo.getProductsBySupplier(supplierId).pipe(
        switchMap(products => {
          const deletes = products.map(product => this.productRepo.deleteProduct(product.id));
          return forkJoin(deletes);
        }),
        switchMap(() => this.deleteSupplier(supplierId))
      );
    }
}