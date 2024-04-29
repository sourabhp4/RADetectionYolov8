import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HistoryContentComponent } from '../history-content/history-content.component';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, HistoryContentComponent],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css',
})
export class HistoryComponent {

  message = 'Loading the history...'
  predictionList: DataOutput[] = []
  isLoaded = false

  constructor(private http: HttpClient, private router: Router) {
    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    const userId = localStorage.getItem('userId')

    if (userId) {
      this.http.post('http://127.0.0.1:5000/history', { userId }, httpOptions).subscribe((res: any) => {

        if (res.status !== 200) {
          this.message = res.error
        } else {
          this.message = ''
          this.predictionList = res.predictionList
          this.isLoaded = true
        }
      })
    }
  }


  onExtend = (index: number) => {
    this.predictionList[index].isExtended = true
  }

  onCompact = (index: number) => {
    this.predictionList[index].isExtended = false
  }
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
