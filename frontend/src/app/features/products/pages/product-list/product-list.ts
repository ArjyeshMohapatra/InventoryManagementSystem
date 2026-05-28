import { Component, inject, OnInit } from '@angular/core';
import { ProductStore } from '../../store/product.store';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [ProductCardComponent, RouterLink],
  templateUrl: './product-list.html'
})
export class ProductList implements OnInit {

  store = inject(ProductStore);

  ngOnInit(): void {

    this.store.loadProducts();

  }

}