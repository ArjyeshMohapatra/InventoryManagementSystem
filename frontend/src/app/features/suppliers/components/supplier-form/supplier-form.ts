import { Component, inject, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { SupplierStore } from '../../store/supplier.store';

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-form.html',
})
export class SupplierForm {
  private supplierStore = inject(SupplierStore);
  suppStore = this.supplierStore;

  form = input.required<FormGroup>();
  loading = input(false);
  buttonText = input('Save');
  submitted = output<void>();

  onSubmit() {
    this.submitted.emit();
  }
}