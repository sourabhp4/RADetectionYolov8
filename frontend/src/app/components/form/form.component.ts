import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Konva from 'konva';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})

export class FormComponent {
  dataInputObj: DataInput

  isOutputAvailable = false
  currentImageClass = ''
  currentImageClassConf = 0.0
  canvasRectType: 'both' | 'positive' | 'negative'
  konvaObject: any
  scale = 1

  statusString = ''
  activeSection = ''

  message = ''

  userToken = ''
  httpOptions = {
    headers: new HttpHeaders({
      'Accept': "Application/json",
      "Content-Type": "Application/json"
    })
  }

  patientList: Patient[] = []
  isLoaded = false
  currentUsername = ''
  currentPatient: Patient = new Patient()
  maxWeeks: number = 0;
  patientListMessage = ''

  imagePredictions: DataOutputImagePrediction[] = []
  resultScore: DataOutputScore

  constructor(private http: HttpClient, private router: Router) {
    this.dataInputObj = new DataInput()
    this.canvasRectType = 'both'
    this.resultScore = new DataOutputScore()
    this.userToken = localStorage.getItem('userToken') || ''
  }

  onUsernameChange(event: any) {
    let value: string = event?.target?.value

    if (value === '') {
      this.isLoaded = false
      return
    }

    this.patientListMessage = 'Finding the patients with similar usernames...'

    if (this.userToken) {
      this.http.post('http://127.0.0.1:5000/getpatients', { userToken: this.userToken, username: value }, this.httpOptions).subscribe((res: any) => {
        if (res.status === 401) {
          this.patientListMessage = 'Unauthorized... Please Login again... Redirecting...'
          setTimeout(() => {
            window.location.href = '/login'
          }, 1500)
        }
        else if (res.status !== 200) {
          this.patientListMessage = res.error
        } else {
          this.patientListMessage = ''
          if (res.patientList?.length === 0)
            this.patientListMessage = 'No patient record found.'
          this.patientList = res.patientList
          this.isLoaded = true
        }
      })
    }
  }

  onClickPatient(patient: Patient) {
    this.dataInputObj.patientId = patient._id
    this.currentPatient = patient
    this.currentUsername = ''
    this.isLoaded = false
    this.calculateMaxWeeks(patient.dob);
    console.log(patient)
  }

  calculateMaxWeeks(dob:string): void {
    const dobDate = new Date(dob);
    const currentDate = new Date();
    const timeDifference = currentDate.getTime() - dobDate.getTime();
    this.maxWeeks = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 7));
  }

  onSubmit(event: any) {
    event.preventDefault()
    
    if (!this.dataInputObj.isAnticcpPresent && !this.dataInputObj.isRfPresent && !this.dataInputObj.isCrpPresent && !this.dataInputObj.isEsrPresent) {
      this.message = 'The Accuracy of final prediction depends on the input of all categories'
    } else {
      this.message = ''
    }

    this.statusString = 'Processing the request...'

    this.dataInputObj.age = this.getAgeFromDOB(this.currentPatient.dob)
    this.dataInputObj.gender = this.currentPatient.gender

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    this.http.post('http://127.0.0.1:5000/predict', this.dataInputObj, httpOptions).subscribe((res: any) => {
      if (res.error) {
        this.statusString = res.error
      } else {
        this.statusString = 'Successfully processed the request. Please scroll down to view the summary.'
        this.isOutputAvailable = true
        this.imagePredictions = res.imagePredictions
        this.resultScore = res.resultScore
        setTimeout(() => {
          this.onResult()
        }, 1000)
      }
    })
  }

  getRectType = (event: any) => {
    let value: string = event?.target?.value
    if (value && (value === 'both' || value === 'positive' || value === 'negative')) {
      this.canvasRectType = event.target.value
    }
    this.onResult()
  }

  onResult = () => {
    this.konvaObject = drawPredictions(this.imagePredictions, this.dataInputObj.image.photoUrl, this.canvasRectType)
    this.konvaObject.on('mousemove', () => {
      let mousePos = this.konvaObject.getPointerPosition()
      if (mousePos !== null) {
        let mouseX = mousePos.x
        let mouseY = mousePos.y

        if (mouseX <= 30 || mouseX >= 670 || mouseY <= 30 || mouseY >= 670)
          this.currentImageClass = ''
        else {
          this.imagePredictions.forEach((prediction) => {
            // Check if mouseX is between x1 and x2, and mouseY is between y1 and y2
            if (mouseX >= prediction.x1 + 30 && mouseX <= prediction.x2 + 30 && mouseY >= prediction.y1 + 30 && mouseY <= prediction.y2 + 30) {
              // If mouse is inside the rectangle, return the class name
              if ((this.canvasRectType === 'negative' && prediction.class.endsWith('1')) || (this.canvasRectType === 'positive' && prediction.class.endsWith('0')))
                return
              this.currentImageClass = prediction.class
              this.currentImageClassConf = prediction.confidence
            }
          })
        }
      }
    })
  }

  @HostListener('window:scroll', ['$event'])
  onWindowScroll(event: any) {
    const instructions = document.getElementById('form-instructions')
    const form = document.getElementById('form')
    const scrollPosition = window.scrollY;

    if (instructions != null && form != null) {
      if (scrollPosition >= instructions.offsetTop && scrollPosition < form.offsetTop) {
        this.activeSection = 'instructions'
      } else if (scrollPosition >= form.offsetTop) {
        this.activeSection = 'form'
      }
    }
  }

  onSectionScroll(sectionId: string) {
    this.activeSection = sectionId
  }

  scrollToSection(sectionId: string): void {
    const section = document.getElementById(sectionId)
    if (section) {
      const offsetTop = section.offsetTop
      window.scrollTo({ top: offsetTop + 10, behavior: 'smooth' })
    }
  }

  getAgeFromDOB(dob: string): number {
    const dobDate = new Date(dob)

    const currentDate = new Date()

    let age = currentDate.getFullYear() - dobDate.getFullYear()

    // Check if birthday has occurred this year
    const currentMonth = currentDate.getMonth()
    const dobMonth = dobDate.getMonth()

    if (currentMonth < dobMonth || (currentMonth === dobMonth && currentDate.getDate() < dobDate.getDate())) {
      age-- // Subtract 1 if birthday hasn't occurred yet
    }

    return age;
  }

  onPatientHistory(patientId: string) {
    this.router.navigate(['/patient', patientId])
  }
}

class Patient {
  _id = ''
  username = ''
  dateOfJoining = ''
  gender = ''
  dob = ''
  numRecords = ''
}

export class DataInput {
  image: { name: string, photoUrl: string }
  age: number
  gender: string
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
  userToken: string

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
    this.userToken = localStorage.getItem('userToken') || ''
  }

  passImageFile(event: any) {
    if (event.target.files && event.target.files[0]) {
      this.image.name = event.target.files[0].name
      var reader = new FileReader()
      reader.onload = (e: any) => {
        this.image.photoUrl = e.target.result
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  passGender(event: any) {
    this.gender = event?.target?.value
  }

  passType(value: String) {
    switch (value) {
      case 'anticcp': this.isAnticcpPresent = !this.isAnticcpPresent
        break
      case 'rf': this.isRfPresent = !this.isRfPresent
        break
      case 'crp': this.isCrpPresent = !this.isCrpPresent
        break
      case 'esr': this.isEsrPresent = !this.isEsrPresent
        break
      default: console.log('Invalid choice')
    }
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

const drawPredictions = (imagePredictions: DataOutputImagePrediction[], imageUrl: string, rectType: string): Konva.Stage => {
  let stage = new Konva.Stage({
    container: 'imageCanvas',
    width: 700,
    height: 700
  })

  let layer = new Konva.Layer()
  stage.add(layer)

  // Load image
  let imageObj = new Image()
  imageObj.onload = () => {
    let image = new Konva.Image({
      image: imageObj,
      x: 30,
      y: 30,
      width: 640,
      height: 640
    })
    layer.add(image)

    if (imagePredictions.length > 5) {
      // Create rectangles
      imagePredictions.forEach((prediction) => {
        let boxColor = 'green'
        if (prediction.class.endsWith('1'))
          boxColor = 'red'

        if (rectType === 'positive' && prediction.class.endsWith('0'))
          return
        if (rectType === 'negative' && prediction.class.endsWith('1'))
          return
        let rect = new Konva.Rect({
          x: prediction.x1 + 30,
          y: prediction.y1 + 30,
          width: prediction.x2 - prediction.x1,
          height: prediction.y2 - prediction.y1,
          stroke: boxColor,
          strokeWidth: 2
        })
        layer.add(rect)
      })
    }

    layer.draw()
  }

  imageObj.src = imageUrl

  return stage
}



