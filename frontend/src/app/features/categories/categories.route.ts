import { Routes } from '@angular/router';
import { CategoryList } from './pages/category-list/category-list';
export const CATEGORY_ROUTES: Routes = [
  {
    path: '',
    component: CategoryList
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('./pages/category-edit/category-edit')
      .then(c => c.CategoryEdit)
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/category-create/category-create')
      .then(c => c.CategoryCreate)
  },
];