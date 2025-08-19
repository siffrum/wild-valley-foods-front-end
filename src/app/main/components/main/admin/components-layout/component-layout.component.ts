import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TopNavComponent } from "../../../internal/Admin/top-nav/top-nav.component";
import { SideNavComponent } from '../../../internal/Admin/side-nav/side-nav.component';

@Component({
  selector: 'app-auth-layout',
  imports: [RouterModule],
  templateUrl: './component-layout.component.html',
  styleUrls: ['./component-layout.component.scss']

})
export class ComponentLayoutComponent {
 isSidebarOpen = false;
}
