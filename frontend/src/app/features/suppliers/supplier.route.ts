import { Routes } from '@angular/router';
import { SupplierList } from './pages/supplier-list/supplier-list';

export const SUPPLIER_ROUTES: Routes = [
  {
    path: '',
    component: SupplierList
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/supplier-edit/supplier-edit')
      .then(c => c.SupplierEdit)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/supplier-create/supplier-create')
      .then(c => c.SupplierCreate)
  },
];