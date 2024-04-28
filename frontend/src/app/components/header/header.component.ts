import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {

  userRole = ''

  constructor () {
    this.userRole = localStorage.getItem('role') || ''
  }

  onlogout () {
    localStorage.removeItem('userToken')
    localStorage.removeItem('role')
    window.location.reload()
  }
}
