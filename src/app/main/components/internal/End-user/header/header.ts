import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,              
  imports: [CommonModule,RouterModule],      
  templateUrl: './header.html',
  styleUrls: ['./header.scss']   
})
export class Header {
  isLoggedIn: boolean = false;
}
