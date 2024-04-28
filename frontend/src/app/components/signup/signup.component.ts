import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  username: string
  role: string
  password: string
  rePassword: string
  message = ''
  dob = ''
  gender = 'male'
  maxDate = ''

  constructor(private http: HttpClient, private router: Router) {
    this.username = ''
    this.role = 'patient'
    this.password = ''
    this.rePassword = ''

    const date = new Date()
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    this.maxDate = `${year}-${month}-${day}`
    
  }

  onSubmit() {

    if (this.username === '' || this.password === '' || this.rePassword === '') {
      this.message = 'All fields are required'
      return
    }
    if (this.password !== this.rePassword) {
      this.message = 'Both passwords must match'
      return
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    this.http.post('http://127.0.0.1:5000/signup', { username: this.username, password: this.password, role: this.role, dob: this.dob, gender: this.gender }, httpOptions).subscribe((res: any) => {
      if (res.status && res.status !== 200) {
        this.message = res.error
      } else {
        this.message = 'SignUp Successful... Redirecting to Login...'
        localStorage.setItem('userId', res.userId)
        setTimeout(() => {
          this.router.navigate(['/login'])
        }, 1000)
      }
    })
  }

  onRoleChange(role: string) {
    this.role = role
  }

  onGenderChange(gender: string) {
    this.gender = gender
  }
}
