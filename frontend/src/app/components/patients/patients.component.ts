import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent {
  message = ''
  isLoaded = false
  patientList: DataUser[] = []

  constructor(private http: HttpClient, private router: Router) {

    this.isLoaded = false
    this.message = `Loading the patients data...`
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    const userToken = localStorage.getItem('userToken')

    if (userToken) {
      this.http.post('http://127.0.0.1:5000/patients', { userToken }, httpOptions).subscribe((res: any) => {
        if (res.status === 401) {
          this.message = 'Unauthorized... Please Login again... Redirecting...'
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }
        else if (res.status !== 200) {
          this.message = res.error
        } else {
          this.message = ''
          this.patientList = res.patientList
          this.isLoaded = true
        }
      })
    } else {
      this.message = 'Unauthorized... Redirecting...'
      setTimeout(() => {
        window.location.href = '/login'
      }, 1500)
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