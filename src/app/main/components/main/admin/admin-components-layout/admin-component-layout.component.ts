import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterModule],
  templateUrl: './admin-component-layout.component.html',
  styleUrls: ['./admin-component-layout.component.scss']

})
export class AdminComponentLayoutComponent {
 isSidebarOpen = false;
}
