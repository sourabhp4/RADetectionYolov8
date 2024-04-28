import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string
  password: string
  message = ''

  constructor(private http: HttpClient, private router: Router) {
    this.username = ''
    this.password = ''

    if (localStorage.getItem('userToken')){
      localStorage.removeItem('userToken')
      localStorage.removeItem('role')
    }
  }

  onSubmit() {

    if (this.username === '' || this.password === ''){
      this.message = 'Both username and passwords are required'
      return
    }

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    this.http.post('http://127.0.0.1:5000/login', { username: this.username, password: this.password }, httpOptions).subscribe((res: any) => {
      if (res.status && res.status !== 200) {
        this.message = res.error
      } else {
        this.message = 'Login Successful... Redirecting...'
        localStorage.setItem('userToken', res.userToken)
        localStorage.setItem('role', res.userRole)
        setTimeout(() => {
          this.router.navigate(['/'])
        }, 2000)
      }
    })
  }

}
