import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  email: string | null = null;
  profileLetter: string = '';
  isDarkMode: boolean = false;
  showDropdown: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.email = localStorage.getItem('email');
    if (this.email) {
      this.profileLetter = this.email.charAt(0).toUpperCase();
    }
    this.isDarkMode = document.body.classList.contains('dark-mode');
  }

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-mode', this.isDarkMode);
  }

  logout() {
    localStorage.removeItem('email');
    localStorage.removeItem('token');
    this.router.navigate(['/']);
  }
}
