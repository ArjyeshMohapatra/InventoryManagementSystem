import { Component, effect, inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { SupplierForm } from '../../components/supplier-form/supplier-form';
import { SupplierStore } from '../../store/supplier.store';
import { Supplier } from '../../models/supplier.model';

@Component({
  selector: 'app-supplier-edit',
  standalone: true,
  imports: [ReactiveFormsModule, SupplierForm],
  templateUrl: './supplier-edit.html',
})
export class SupplierEdit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private supplierStore = inject(SupplierStore);

  suppStore = this.supplierStore;

  id = String(this.route.snapshot.paramMap.get('id'));

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

  constructor() {
    this.suppStore.loadSupplierById(this.id);

    effect(() => {
      const supplierData = this.suppStore.selectedSupplier();

      if (supplierData) {
        this.form.patchValue(supplierData);
      }
    });
  }

  submit() {
    if (this.form.invalid) return;

    const updatedSupplier = { ...this.form.value, id: this.id};

    this.suppStore.updateSupplier(updatedSupplier as Supplier, () => {
      this.router.navigate(['/suppliers']);
    });
  }
}