import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent {
  message = ''
  isLoaded = false
  userList: DataUser[] = []
  presentRole = 'patient'

  constructor(private http: HttpClient, private router: Router) {
    this.getData(this.presentRole)
  }

  onRoleChange = (role: string) => {
    this.presentRole = role
    this.getData(role)
  }

  getData(role: string) {
    this.isLoaded = false
    this.message = `Loading the ${role}s data...`
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    const userToken = localStorage.getItem('userToken')

    if (userToken) {
      this.http.post('http://127.0.0.1:5000/users', { userToken, presentRole: role }, httpOptions).subscribe((res: any) => {
        if (res.status !== 200) {
          this.message = res.error
        } else {
          this.message = ''
          this.userList = res.userList
          this.isLoaded = true
        }
      })
    } else {
      this.message = 'Unauthorized... Redirecting...'
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500);
    }
  }

  approveDoctor = (doctorId: string) => {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }
    const userToken = localStorage.getItem('userToken')

    if (userToken) {
      this.http.post('http://127.0.0.1:5000/approvedoctor', { userToken, doctorId }, httpOptions).subscribe((res: any) => {
        if (res.status === 401) {
          this.message = 'Unauthorized... Redirecting...'
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500);
        }
        else if (res.status !== 200) {
          this.message = res.error
        } else {
          this.message = ''
          this.getData(this.presentRole)
        }
      })
    }
  }
}

class DataUser {
  _id = ''
  username = ''
  role = ''
  dateOfJoining = ''
  numRecords = ''
  status = ''
}