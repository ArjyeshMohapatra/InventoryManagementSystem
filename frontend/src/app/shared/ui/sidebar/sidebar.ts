import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faGauge, faBox, faTruck, faLayerGroup, faBoxesStacked } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, FontAwesomeModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  isOpen = input(false);
  closeSidebar = output<void>();

  faDashboard = faGauge;
  faProducts = faBox;
  faSuppliers = faTruck;
  faCategories = faLayerGroup;
  faBoxesStacked = faBoxesStacked;
}
