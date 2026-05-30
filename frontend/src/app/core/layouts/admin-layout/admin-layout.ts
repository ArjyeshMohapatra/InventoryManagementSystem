import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, Sidebar } from '../../../shared/ui';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',
})
export class AdminLayout {
  isSidebarOpen = signal(false);
}
