import { Routes } from '@angular/router';
import { ProductList } from './pages/product-list/product-list';

export const PRODUCT_ROUTES: Routes = [
  {
    path: '',
    component: ProductList
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/product-edit/product-edit')
      .then(c => c.ProductEdit)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/product-create/product-create')
      .then(c => c.ProductCreate)
  },
  {
    path: 'history/:id',
    loadComponent: () =>
      import('./pages/product-history/product-history')
      .then(c => c.ProductHistory)
  }
];