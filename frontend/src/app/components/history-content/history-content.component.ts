import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import Konva from 'konva';

@Component({
  selector: 'app-history-content',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './history-content.component.html',
  styleUrl: './history-content.component.css',
})
export class HistoryContentComponent implements OnInit {
  @Input() prediction!: DataOutput

  currentImageClass = ''
  currentImageClassConf = 0.0
  canvasRectType: 'both' | 'positive' | 'negative' = 'both'
  konvaObject: any
  scale = 1

  constructor() {
  }

  ngOnInit(): void {
    setTimeout(() => {
      this.onResult()
    }, 1000)
  }

  getRectType = (event: any) => {
    let value: string = event?.target?.value
    if (value && (value === 'both' || value === 'positive' || value === 'negative')) {
      this.canvasRectType = event.target.value
    }
    this.onResult()
  }

  onResult = () => {
    this.konvaObject = drawPredictions(this.prediction.imagePredictions, this.prediction.image.photoUrl, this.canvasRectType, this.prediction._id)
    this.konvaObject.on('mousemove', () => {
      let mousePos = this.konvaObject.getPointerPosition()
      if (mousePos !== null) {
        let mouseX = mousePos.x
        let mouseY = mousePos.y

        if (mouseX <= 30 || mouseX >= 670 || mouseY <= 30 || mouseY >= 670)
          this.currentImageClass = ''
        else {
          this.prediction.imagePredictions.forEach((prediction1) => {
            // Check if mouseX is between x1 and x2, and mouseY is between y1 and y2
            if (mouseX >= prediction1.x1 + 30 && mouseX <= prediction1.x2 + 30 && mouseY >= prediction1.y1 + 30 && mouseY <= prediction1.y2 + 30) {
              // If mouse is inside the rectangle, return the class name
              if ((this.canvasRectType === 'negative' && prediction1.class.endsWith('1')) || (this.canvasRectType === 'positive' && prediction1.class.endsWith('0')))
                return
              this.currentImageClass = prediction1.class
              this.currentImageClassConf = prediction1.confidence
            }
          })
        }
      }
    })
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

class DataOutputImagePrediction {
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

class DataOutputScore {
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

const drawPredictions = (imagePredictions: DataOutputImagePrediction[], imageUrl: string, rectType: string, id: string): Konva.Stage => {
  let stage = new Konva.Stage({
    container: id,
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
