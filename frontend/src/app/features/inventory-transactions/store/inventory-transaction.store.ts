import { Injectable, inject, signal } from '@angular/core';
import { finalize, retry } from 'rxjs';

import { CacheStore } from 'src/app/shared/store/cache.store';
import { InventoryTransaction } from '../models/inventory-transaction.model';
import { InventoryTransactionRepository } from '../../../core/api/repositories/inventory-transaction.repository';
import { Product } from '../../products/models/product.model';

@Injectable({
    providedIn: 'root'
})
export class InventoryTransactionStore extends CacheStore {

    private transactionRepo = inject(InventoryTransactionRepository);

    transactions = signal<InventoryTransaction[]>([]);

    loadTransactions(force = false) {

        const hasTransactions = this.transactions().length > 0;

        if (!force && this.isCacheValid(hasTransactions)) return;
        if (this.fetching()) return;

        if (this.transactions().length) {
            this.refreshing.set(true);
        } else {
            this.loading.set(true);
        }

        this.error.set(null);
        this.fetching.set(true);

        this.transactionRepo.getTransactions().pipe(
            retry({
                count: this.retryCount,
                delay: this.retryDelay
            }),
            finalize(() => {
                this.loading.set(false);
                this.refreshing.set(false);
                this.fetching.set(false);
            })
        ).subscribe({
            next: (transactions) => {
                this.transactions.set(transactions);
                this.lastLoaded.set(Date.now());
            },
            error: () => {
                this.error.set('Failed to load inventory transactions');
            }
        });
    }

    getTransactionsByProduct(productId: Product['id']) {
        return this.transactions().filter(transaction =>
                transaction.productId === productId
        );
    }

    addTransaction(transaction: InventoryTransaction, onSuccess?: () => void) {
        this.loading.set(true);

        this.transactionRepo.addTransaction(transaction).pipe(
            finalize(() => {
                this.loading.set(false);
            })
        ).subscribe({
            next: (created) => {
                this.transactions.update(
                    transactions => [
                        ...transactions,
                        created
                    ]
                );
                onSuccess?.();
            },
            error: () => {
                this.error.set(
                    'Failed to add transaction'
                );
            }
        });
    }
}