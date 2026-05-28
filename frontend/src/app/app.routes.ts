import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () =>
      import('./core/layouts/admin-layout/admin-layout')
      .then(c => c.AdminLayout),

    children: [

      {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
      },

      /* {
        path: 'dashboard',
        loadChildren: () =>
          import('./features/dashboard/dashboard.routes')
          .then(r => r.DASHBOARD_ROUTES)
      }, */

      {
        path: 'products',
        loadChildren: () =>
          import('./features/products/product.route')
          .then(r => r.PRODUCT_ROUTES)
      }

    ]
  }

];