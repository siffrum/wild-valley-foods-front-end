import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Header } from '../../../internal/End-user/header/header';
import { Footer } from '../../../internal/End-user/footer/footer';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-end-user-layout',
  imports: [RouterModule, RouterOutlet,Header,Footer,CommonModule],
  templateUrl: './end-user-layout.html',
  styleUrl: './end-user-layout.scss'
})
export class EndUserLayout {

}
