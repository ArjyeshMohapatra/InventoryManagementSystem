import { Component, input, inject } from '@angular/core';
import { Product } from '../../models/product.model';
import { signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductQueryService } from '../../queryService/product.query.service';
import { Modal } from '../../../../shared/ui/modal/modal';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [RouterLink, Modal],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  private productQueryService = inject(ProductQueryService);
  product = input.required<Product>();
  showDeleteModal = signal(false);

  deleteMutation = this.productQueryService.deleteProductMutation();

  openDeleteModal() { this.showDeleteModal.set(true); }
  closeDeleteModal() { this.showDeleteModal.set(false); }
  deleteProduct() {
    this.deleteMutation.mutate(this.product().id, {
      onSuccess: () => {
        this.closeDeleteModal();
      }
    });
  }
}