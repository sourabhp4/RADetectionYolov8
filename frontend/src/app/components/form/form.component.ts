import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Konva from 'konva';

@Component({
  selector: 'app-form',
  standalone: true,
  imports: [FormsModule, HttpClientModule, CommonModule],
  templateUrl: './form.component.html',
  styleUrl: './form.component.css'
})

export class FormComponent {
  dataInputObj: DataInput

  isImageOutputAvailable = false
  currentImageClass = ''
  currentImageClassConf = 0.0
  canvasRectType: 'both' | 'positive' | 'negative'

  constructor(private http: HttpClient) {
    this.dataInputObj = new DataInput()
    this.canvasRectType = 'both'
  }
  
  imagePredictions: DataOutputImagePrediction[] = []

  onSubmit(event: any) {
    event.preventDefault()
    console.log('hello')

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    this.http.post('http://127.0.0.1:5000/predict', this.dataInputObj, httpOptions).subscribe((res: any) => {
      if (res.error) {
        console.log(res.error)
      } else if (res.imageError) {
        console.log(res.imageError)
      } else if (res.bloodError) {
        console.log(res.imagePredictions, res.bloodError)
      } else {
        this.isImageOutputAvailable = true
        this.imagePredictions = res.imagePredictions
        this.onResult()
        console.log(res.imagePredictions, res.bloodPredictions)
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
    let konvaObject: Konva.Stage
    konvaObject = drawPredictions(this.imagePredictions, this.dataInputObj.image.photoUrl, this.canvasRectType)
    konvaObject.on('mousemove', () => {
      let mousePos = konvaObject.getPointerPosition()
      if (mousePos !== null) {
        let mouseX = mousePos.x
        let mouseY = mousePos.y

        if (mouseX <= 30 || mouseX >= 670 || mouseY <= 30 || mouseY >= 670)
          this.currentImageClass = ''
        else {
          this.imagePredictions.forEach( (prediction) => {
            // Check if mouseX is between x1 and x2, and mouseY is between y1 and y2
            if (mouseX >= prediction.x1 + 30 && mouseX <= prediction.x2 + 30 && mouseY >= prediction.y1 + 30 && mouseY <= prediction.y2 + 30) {
              // If mouse is inside the rectangle, return the class name
              if( (this.canvasRectType === 'negative' && prediction.class.endsWith('1')) || (this.canvasRectType === 'positive' && prediction.class.endsWith('0')))
                return
              this.currentImageClass = prediction.class
              this.currentImageClassConf = prediction.confidence
            }
          })
        }
      }
    })
  }
}

export class DataInput {
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

    layer.draw()
  }

  imageObj.src = imageUrl

  return stage
}