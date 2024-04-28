import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patients',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent {
  message = ''
  isLoaded = false
  patientList: DataUser[] = []
  currentSearchString = ''

  constructor(private http: HttpClient, private router: Router) {

    this.getData ()
  }

  getData () {
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
      this.http.post('http://127.0.0.1:5000/patients', { userToken, searchString: this.currentSearchString }, httpOptions).subscribe((res: any) => {
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

  onSearchChange(event: any) {
    let value: string = event?.target?.value

    this.currentSearchString = value

    this.getData()
  }

  getAgeFromDOB(dob: string): number {
    // Convert DOB string to Date object
    const dobDate = new Date(dob);

    // Get current date
    const currentDate = new Date();

    // Calculate age
    let age = currentDate.getFullYear() - dobDate.getFullYear();

    // Check if birthday has occurred this year
    const currentMonth = currentDate.getMonth();
    const dobMonth = dobDate.getMonth();

    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDate.getDate() < dobDate.getDate())) {
      age--; // Subtract 1 if birthday hasn't occurred yet
    }

    return age;
  }

  onClickPatient(patientId: string) {
    this.router.navigate(['/patient', patientId])
  }
}

class DataUser {
  _id = ''
  username = ''
  role = ''
  dateOfJoining = ''
  numRecords = ''
  status = ''
  gender = ''
  dob = ''
  age = ''
}