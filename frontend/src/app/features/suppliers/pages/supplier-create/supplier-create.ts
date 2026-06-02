import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SupplierForm } from '../../components/supplier-form/supplier-form';
import { SupplierStore } from '../../store/supplier.store';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-create',
  standalone: true,
  imports: [ReactiveFormsModule, SupplierForm],
  templateUrl: './supplier-create.html',
})
export class SupplierCreate {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private supplierStore = inject(SupplierStore);

  suppStore = this.supplierStore;

  form = this.fb.group({
    name: [''],
    company: [''],
    contactPerson: [''],
    contactPersonGender: [''],
    email: [''],
    phone: [''],
    website: [''],
    gstNumber: [''],
    address: ['']
  });

  submit() {
    if (this.form.invalid) return;

    this.suppStore.addSupplier(this.form.value as Supplier, () => {
      this.router.navigate(['/suppliers']);
    });
  }
}