import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { InventoryTransaction } from '../../../features/inventory-transactions/models/inventory-transaction.model';
import { Product } from '../../../features/products/models/product.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryTransactionRepository {
  private http = inject(HttpClient);

  private transactionsApi = `${environment.apiUrl}/inventoryTransactions`;

  getTransactions(): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(this.transactionsApi);
  }

  getTransactionsByProduct(productId: Product['id']): Observable<InventoryTransaction[]> {
    return this.http.get<InventoryTransaction[]>(`${this.transactionsApi}?productId=${productId}`);
  }

  addTransaction(transaction: InventoryTransaction): Observable<InventoryTransaction> {
    return this.http.post<InventoryTransaction>(this.transactionsApi, transaction);
  }
}