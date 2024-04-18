import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormComponent } from './components/form/form.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
    { 'path': '', 'title': 'Home', component: HomeComponent },
    { 'path': 'form', 'title': 'Form', component: FormComponent },
    { 'path': 'history', 'title': 'History', component: HistoryComponent },
    { 'path': 'login', 'title': 'Login', component: LoginComponent },
    { 'path': 'signup', 'title': 'SignUp', component: SignupComponent },
];
