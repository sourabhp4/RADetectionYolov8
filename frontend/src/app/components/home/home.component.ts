import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  images = [
    { src: '/assets/slider1.png', title: '' },
    { src: '/assets/slider2.png', title: '' },
    { src: '/assets/slider3.png', title: '' },
  ]

  currentSlide = 0
  timer: any
  carouselImage: any = null

  constructor() { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.carouselImage = document.getElementById('carousel-image')
    this.startSlider()
  }

  ngOnDestroy() {
    clearInterval(this.timer)
  }

  startSlider() {
    this.timer = setInterval(() => {
      this.next()
    }, 3000)
  }

  next(): void {
    if (this.currentSlide < this.images.length - 1) {
      if (this.carouselImage == null) {
        this.currentSlide++
      } else {
        this.carouselImage.style.opacity = 0 // Fade out
        setTimeout(() => {
          this.currentSlide++
          this.carouselImage.setAttribute('src', this.images[this.currentSlide].src)
          this.carouselImage.style.opacity = 1 // Fade in
        }, 300)
      }
    } else {
      if (this.carouselImage == null) {
        this.currentSlide = 0
      } else {
        this.currentSlide = 0
        this.carouselImage.style.opacity = 0 // Fade out
        setTimeout(() => {
          this.carouselImage.setAttribute('src', this.images[this.currentSlide].src)
          this.carouselImage.style.opacity = 1 // Fade in
        }, 300)
      }
    }
  }

  prev(): void {
    if (this.currentSlide > 0) {
      if (this.carouselImage == null) {
        this.currentSlide--
      } else {
        this.carouselImage.style.opacity = 0 // Fade out
        setTimeout(() => {
          this.currentSlide--
          this.carouselImage.setAttribute('src', this.images[this.currentSlide])
          this.carouselImage.style.opacity = 1 // Fade in
        }, 300)
      }
    } else {
      if (this.carouselImage == null) {
        this.images.length - 1
      } else {
        this.images.length - 1
        this.carouselImage.style.opacity = 0 // Fade out
        setTimeout(() => {
          this.carouselImage.setAttribute('src', this.images[this.currentSlide])
          this.carouselImage.style.opacity = 1 // Fade in
        }, 300)
      }
    }
  }

}
