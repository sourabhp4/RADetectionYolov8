import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { FooterComponent } from './components/footer/footer.component';
import { HeaderComponent } from './components/header/header.component';
import { HttpClient, HttpClientModule, HttpHeaders } from '@angular/common/http';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, FooterComponent, HeaderComponent, HttpClientModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {

  checkFlag:boolean
  currentRoute = ''

  privateRoutes = ['/', '', '/form', '/history', 'users', 'patients']
  publicRoutes = ['/signup', '/login']

  constructor(private http: HttpClient, private router: Router) {

    const httpOptions = {
      headers: new HttpHeaders({
        'Accept': "Application/json",
        "Content-Type": "Application/json"
      })
    }

    this.checkFlag = true

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.url
      if (this.publicRoutes.includes(event.url)) {
        this.checkFlag = false
      } else if (this.privateRoutes.includes(event.url)) {
        const userToken = localStorage.getItem('userToken')

        if (userToken) {
          this.http.post('http://127.0.0.1:5000/checkuser', { userToken }, httpOptions).subscribe((res: any) => {
            if (res.status !== 200) {
              this.router.navigate(['/login'])
            } else {
              localStorage.setItem('userToken', res.userToken)
              localStorage.setItem('role', res.userRole)
              this.checkFlag = true
            }
          })
        } else {
          this.router.navigate(['/login'])
        }
      }
    })
  }
}
