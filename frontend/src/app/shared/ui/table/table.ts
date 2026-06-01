import {
  Component, input, TemplateRef, ViewChild, AfterViewInit, effect, OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
  ChangeDetectorRef,
  inject,
  signal,
  output
 } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CdkDropList, CdkDrag, CdkDragHandle, CdkDragDrop } from '@angular/cdk/drag-drop';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGripVertical } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [MatTableModule, TitleCasePipe, CommonModule, MatSort, MatSortHeader, MatPaginator, MatPaginatorModule,
    CdkDropList, CdkDrag, CdkDragHandle, FontAwesomeModule

  ],
  templateUrl: './table.html',
  styleUrl: './table.css',
})
export class Table implements OnInit, AfterViewInit, OnDestroy {
  // --- INPUT SIGNALS ---
  columns = input<string[]>([]);
  data = input<any[]>([]);
  actions = input(false);
  actionTemplate = input<TemplateRef<any> | undefined>(undefined);

  dragEnabled = input(false);
  draggedRow = signal<any | null>(null);
  targetRow = signal<any | null>(null);
  rowDropped = output<CdkDragDrop<any[]>>();

  gripIcon = faGripVertical;

  // --- MATERIAL VIEW CHILDREN ---
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // --- COMPONENT STATE ---
  dataSource = new MatTableDataSource<any>();
  columnWidths: Record<string, number> = {};
  private storageKey = 'table-column-widths';

  // --- RESIZE TRACKING STATE ---
  private currentColumn = '';
  private startX = 0;
  private startWidth = 0;

  // --- EVENT LISTENERS (Stored for cleanup to prevent memory leaks) ---
  private moveListener?: () => void;
  private upListener?: () => void;
  private handleListeners: Array<() => void> = [];

  // --- DEPENDENCY INJECTION ---
  private renderer = inject(Renderer2);      // Safely manipulates the DOM directly
  private host = inject(ElementRef<HTMLElement>); // Gets the root element of this component
  private cdr = inject(ChangeDetectorRef);   // Triggers Angular change detection manually

  constructor() {
    // EFFECT: Runs whenever the 'data' signal changes
    effect(() => {
      const currentData = this.data();
      this.dataSource.data = currentData;
      
      // Crucial: Re-attach Sort and Paginator because setting new data can detach them
      if (this.sort) this.dataSource.sort = this.sort;
      if (this.paginator) this.dataSource.paginator = this.paginator;
      
      // If we actually have data, wait a tick for the DOM to render the new rows/headers,
      // then inject the resize handles.
      if (currentData.length > 0) {
        setTimeout(() => this.addResizeHandles());
      }
    });
  }

  ngOnInit(): void {
    // Load previously saved column widths from localStorage on boot
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.columnWidths = JSON.parse(saved);
    }
  }

  ngAfterViewInit(): void {
    // Initial wiring up of Material components
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;

    // Wait for the initial table render, then attach the draggable handles to the headers
    setTimeout(() => {
      this.addResizeHandles();
    });

    // Material Table sorting breaks with Signals sometimes. 
    // This custom accessor forces it to read the raw object properties correctly.
    this.dataSource.sortingDataAccessor = (item, property) => {
      return item[property];
    };

    // Forces the table to listen to the new sort/paginator assignments
    this.dataSource._updateChangeSubscription();
  }

  ngOnDestroy(): void {
    // CLEANUP: If the component dies, destroy all global DOM listeners to prevent memory leaks
    this.removeDocumentListeners();
    this.handleListeners.forEach(unlisten => unlisten());
  }

  drop(event: CdkDragDrop<any[]>) {
    this.rowDropped.emit(event);
    this.draggedRow.set(null);
    this.targetRow.set(null);
  }

  // --- HELPER METHODS ---

  /** * Fetches the width for a specific column. Defaults to 160px if not found.
   * This is bound to the <col> tags in the HTML <colgroup>.
   */
  getColumnWidth(column: string): number {
    return this.columnWidths[column] || 160;
  }

  private addResizeHandles(): void {
    // Find every rendered Material header cell
    const headerCells = this.host.nativeElement.querySelectorAll('th.mat-mdc-header-cell');
    
    headerCells.forEach((cell: Element) => {
      const column = this.getColumnName(cell as HTMLElement);
  
      // Skip if it's not a mapped column or if we already added a handle to it
      if (!column || this.hasResizeHandle(cell as HTMLElement)) return;
  
      // Create the physical grab handle
      const handle = this.renderer.createElement('span');
      this.renderer.addClass(handle, 'table-resize-handle');
  
      // Force the cell to relative so the absolute handle anchors to its right edge
      this.renderer.setStyle(cell, 'position', 'relative');
  
      // Style the invisible grab area (8px wide, full height, right edge)
      this.renderer.setStyle(handle, 'position', 'absolute');
      this.renderer.setStyle(handle, 'top', '0');
      this.renderer.setStyle(handle, 'right', '0');
      this.renderer.setStyle(handle, 'width', '8px');
      this.renderer.setStyle(handle, 'height', '100%');
      this.renderer.setStyle(handle, 'cursor', 'col-resize');
      this.renderer.setStyle(handle, 'user-select', 'none'); // Stops text highlighting while dragging
      this.renderer.setStyle(handle, 'z-index', '100');
  
      // Inject handle into the DOM
      this.renderer.appendChild(cell, handle);
  
      // Listen for the mouse click to start dragging. Save the listener reference so we can kill it later.
      const unlisten = this.renderer.listen(handle, 'mousedown',(event: MouseEvent) => {
          this.startResize(event, column);
        }
      );
      this.handleListeners.push(unlisten);
    });
  }

  // --- RESIZE LOGIC ---

  private startResize(event: MouseEvent, column: string): void {
    event.preventDefault();
    event.stopPropagation(); // CRITICAL: Stops Material from triggering a column Sort when grabbing the handle
  
    this.currentColumn = column;
    this.startX = event.pageX; // Log where the mouse started
    this.startWidth = this.getColumnWidth(column); // Log the column's starting width
  
    // Clear any stuck listeners, then bind the drag and drop listeners to the whole document
    // (Document level ensures the drag doesn't break if the user moves the mouse really fast)
    this.removeDocumentListeners();
    this.moveListener = this.renderer.listen('document', 'mousemove', this.resizeColumn);
    this.upListener = this.renderer.listen('document', 'mouseup', this.stopResize);
  }

  private resizeColumn = (event: MouseEvent): void => {
    if (!this.currentColumn) return;
  
    // Calculate how far the mouse moved from the origin point
    const diff = event.pageX - this.startX;
    
    // Calculate new width, enforcing a strict minimum of 120px so columns don't vanish
    const newWidth = Math.max(120, this.startWidth + diff);
  
    // Create a new object reference to trigger Angular's change detection on the template bindings
    this.columnWidths = {...this.columnWidths, [this.currentColumn]: newWidth};
    
    // Force UI to update immediately
    this.cdr.detectChanges();
  }

  private stopResize = (): void => {
    // Save the new layout to user's browser so it remembers it next time
    localStorage.setItem(this.storageKey, JSON.stringify(this.columnWidths));
  
    // Unbind global mouse events
    this.removeDocumentListeners();
    this.currentColumn = ''; // Reset state
  }

  // --- UTILITY METHODS ---

  private removeDocumentListeners(): void {
    if (this.moveListener) this.moveListener();
    if (this.upListener) this.upListener();
  
    this.moveListener = undefined;
    this.upListener = undefined;
  }

  private hasResizeHandle(cell: HTMLElement): boolean {
    // Checks if we already injected our span into this specific cell
    return Array.from(cell.children)
      .some(child => child.classList.contains('table-resize-handle'));
  }

  private getColumnName(cell: HTMLElement): string {
    // Material adds classes like "mat-column-firstName". This strips it down to just "firstName".
    const columnClass = Array.from(cell.classList)
        .find(className => className.startsWith('mat-column-'));
  
    return columnClass ? columnClass.replace('mat-column-', '') : '';
  }
}