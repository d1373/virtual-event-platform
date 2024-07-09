import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {
  isFlipped = false;
  shake = false;
  errorMessage: string | null = null;
  private apiUrl = 'http://localhost:5000/api/users';

  constructor(private router: Router) {}

  toggleFlip() {
    this.isFlipped = !this.isFlipped;
  }

  triggerShake() {
    this.shake = true;
    setTimeout(() => {
      this.shake = false;
    }, 500);
  }

  async onLogin(event: Event, email: string, password: string) {
    event.preventDefault();
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ email, password });

    try {
      const response = await fetch(`${this.apiUrl}/login`, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      console.log('Login successful', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email); // Set session variable
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login error', error);
      this.errorMessage = 'Login details are incorrect';
      this.triggerShake();
    }
  }

  async onRegister(event: Event, name: string, email: string, password: string) {
    event.preventDefault();
    const headers = { 'Content-Type': 'application/json' };
    const body = JSON.stringify({ name, email, password });

    try {
      const response = await fetch(`${this.apiUrl}/register`, {
        method: 'POST',
        headers: headers,
        body: body
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      const data = await response.json();
      console.log('Registration successful', data);
      localStorage.setItem('token', data.token);
      localStorage.setItem('email', email); // Set session variable
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Registration error', error);
      this.errorMessage = 'Registration details are incorrect';
      this.triggerShake();
    }
  }

  closePopup() {
    this.errorMessage = null;
  }
}
