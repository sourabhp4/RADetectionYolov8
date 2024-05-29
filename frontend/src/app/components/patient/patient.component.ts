import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryContentComponent } from '../history-content/history-content.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-patient',
  standalone: true,
  imports: [CommonModule, HistoryContentComponent, FormsModule],
  templateUrl: './patient.component.html',
  styleUrl: './patient.component.css'
})
export class PatientComponent implements OnInit {

  message = 'Loading the patient details and history...'
  historyList: DataOutput[] = []
  isLoaded = false
  patientId = ''
  patientData:Patient = new Patient()

  userToken: any
  httpOptions = {
    headers: new HttpHeaders({
      'Accept': "Application/json",
      "Content-Type": "Application/json"
    })
  }

  constructor(private http: HttpClient, private router: Router, private route: ActivatedRoute) {
    
    this.userToken = localStorage.getItem('userToken')
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.patientId = params['patientId']
      this.getData(params['patientId'])
    })
  }

  getData(patientId: string) {
    
    if (this.userToken) {
      this.http.post('http://127.0.0.1:5000/getpatientdetails', { userToken: this.userToken, patientId }, this.httpOptions).subscribe((res: any) => {

        if (res.status !== 200) {
          this.message = res.error
        } else {
          this.message = ''
          this.historyList = res.historyList
          this.patientData = res.patientData
          this.isLoaded = true
        }
      })
    }
  }

  onExtend = (index: number) => {
    this.historyList[index].isExtended = true
  }

  onCompact = (index: number) => {
    this.historyList[index].isExtended = false
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

  onCommentSubmit (event:any, i: number) {
    event?.preventDefault()

    this.historyList[i].commentMessage = 'Processing the request...'

    if (this.userToken) {
      this.http.post('http://127.0.0.1:5000/addcomment', { userToken: this.userToken, predictionId: this.historyList[i]._id, comment: this.historyList[i].newComment }, this.httpOptions).subscribe((res: any) => {
        if (res.status !== 200) {
          this.historyList[i].commentMessage = res.error
        } else {
          this.historyList[i].commentMessage = 'Successfully added comment. Fetching updated records...'
          setTimeout(() => {
            this.getData(this.patientId)
          }, 1000)
        }
      })
    }
  }

  // onUpdateCommentSubmit (event:any, i: number) {
  //   event?.preventDefault()

  //   this.historyList[i].commentMessage = 'Processing the request...'

  //   if (this.userToken) {
  //     this.http.post('http://127.0.0.1:5000/updatecomment', { userToken: this.userToken, predictionId: this.historyList[i]._id, comment: this.historyList[i].comment}, this.httpOptions).subscribe((res: any) => {
  //       if (res.status !== 200) {
  //         this.historyList[i].commentMessage = res.error
  //       } else {
  //         this.historyList[i].commentMessage = 'Successfully updated comment. Fetching updated records...'
  //         setTimeout(() => {
  //           this.getData(this.patientId)
  //         }, 1000)
  //       }
  //     })
  //   }
  // }
}

class Patient {
  username = ''
  role = ''
  status = ''
  gender = ''
  dob = ''
  dateOfJoining = ''
  _id = ''
}


class DataOutput {
  image: { name: string, photoUrl: string }
  age: number
  gender: 'male' | 'female'
  isAnticcpPresent: boolean
  anticcpValue: number
  isRfPresent: boolean
  rfValue: number
  isCrpPresent: boolean
  crpValue: number
  isEsrPresent: boolean
  esrValue: number
  affectDuration: number
  patientId: string
  userId: string
  date = ''
  imagePredictions: DataOutputImagePrediction[] = []
  resultScore: DataOutputScore = new DataOutputScore()
  isExtended = false
  _id = ''
  consultedBy = ''
  comment: [{
    on: string,
    username: string,
    id: string,
    message: string
  }]
  isCommentPresent = false
  commentMessage = ''
  newComment = ''

  constructor() {
    this.image = { name: '', photoUrl: '' }
    this.age = 0
    this.gender = 'male'
    this.isAnticcpPresent = false
    this.anticcpValue = 0
    this.isRfPresent = false
    this.rfValue = 0
    this.isCrpPresent = false
    this.crpValue = 0
    this.isEsrPresent = false
    this.esrValue = 0
    this.affectDuration = 0
    this.patientId = ''
    this.userId = ''
    this.comment = [{ on: '', username: '', id: '', message: '' }]
  }
}

export class DataOutputImagePrediction {
  class: string
  confidence: number
  x1: number
  y1: number
  x2: number
  y2: number

  constructor() {
    this.class = ''
    this.confidence = 0.0
    this.x1 = 0.0
    this.y1 = 0.0
    this.x2 = 0.0
    this.y2 = 0.0
  }
}

export class DataOutputScore {
  category_1: {
    message: string
    score: number
  }
  category_2: {
    message: string
    score: number
  }
  category_3: {
    message: string
    score: number
  }
  category_4: {
    message: string
    score: number
  }
  output: {
    message: string
    score: number
  }

  constructor() {
    this.category_1 = { message: '', score: 0 }
    this.category_2 = { message: '', score: 0 }
    this.category_3 = { message: '', score: 0 }
    this.category_4 = { message: '', score: 0 }
    this.output = { message: '', score: 0 }
  }
}

