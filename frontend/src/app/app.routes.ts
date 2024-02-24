import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormComponent } from './components/form/form.component';

export const routes: Routes = [
    { 'path': '', 'title': 'Home', component: HomeComponent },
    { 'path': 'form', 'title': 'Form', component: FormComponent },
];
