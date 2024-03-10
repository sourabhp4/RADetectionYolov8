import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  images = [
    { src: 'assets/slider1.png', title: 'Slider1' },
    { src: 'assets/slider2.png', title: 'Slider2' }
  ];

  currentSlide = 0;
  slideWidth!: number;
  timer: any;

  @ViewChild('carousel') carousel!: ElementRef<HTMLDivElement>;

  constructor() {}

  ngOnInit() {
    this.slideWidth = this.carousel.nativeElement.clientWidth;
    this.carousel.nativeElement.style.transform = `translateX(0px)`; // Set initial position to first slide
    this.startSlider();
  }

  ngOnDestroy() {
    clearInterval(this.timer); // Clear the timer when component is destroyed
  }

  startSlider() {
    this.timer = setInterval(() => {
      this.next();
    }, 3000); // Change slide every 3 seconds
  }

  next(): void {
    if (this.currentSlide < this.images.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0; // Reset to the first slide if at the end
    }
    this.updateCarousel();
  }

  prev(): void {
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.images.length - 1; // Go to the last slide if at the beginning
    }
    this.updateCarousel();
  }

  updateCarousel(): void {
    if (this.carousel && this.carousel.nativeElement) {
      const newTransform = -this.currentSlide * this.slideWidth;
      this.carousel.nativeElement.style.transform = `translateX(${newTransform}px)`;
    }
  }
}
