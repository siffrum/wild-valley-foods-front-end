import { CommonModule, NgIf } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,              
  imports: [CommonModule],      
  templateUrl: './header.html',
  styleUrls: ['./header.scss']   
})
export class Header {
  isLoggedIn: boolean = false;
}
