import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Supplier } from '../../../features/suppliers/models/supplier.model';

@Injectable({
  providedIn: 'root',
})
export class SupplierRepository {
  private http = inject(HttpClient);

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

  deleteSupplier(id: string) {
    return this.http.delete(`${this.suppliersApi}/${id}`);
  }
}