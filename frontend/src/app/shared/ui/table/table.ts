import { Component, input, TemplateRef, ViewChild, AfterViewInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { TitleCasePipe } from '@angular/common';
import {
  MatPaginatorModule,
  MatPaginator
} from '@angular/material/paginator';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, TitleCasePipe, CommonModule, MatSort, MatSortHeader, MatPaginator, MatPaginatorModule],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table implements AfterViewInit{
  columns = input<string[]>([]);
  data = input<any[]>([]);
  actions = input(false);
  actionTemplate = input<TemplateRef<any> | undefined>(undefined);

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  dataSource = new MatTableDataSource<any>();

  constructor() {
    effect(() => {
      this.dataSource.data = this.data();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
    this.dataSource._updateChangeSubscription();
    // Force sort to use the signal-based data effectively
    this.dataSource.sortingDataAccessor = (item, property) => {
      return item[property];
    };
  }
}
