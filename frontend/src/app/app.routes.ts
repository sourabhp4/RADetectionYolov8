import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { FormComponent } from './components/form/form.component';
import { HistoryComponent } from './components/history/history.component';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { UsersComponent } from './components/users/users.component';
import { PatientsComponent } from './components/patients/patients.component';
import { PatientComponent } from './components/patient/patient.component';

export const routes: Routes = [
    { 'path': '', 'title': 'Home', component: HomeComponent },
    { 'path': 'form', 'title': 'Form', component: FormComponent },
    { 'path': 'history', 'title': 'History', component: HistoryComponent },
    { 'path': 'users', 'title': 'Users', component: UsersComponent },
    { 'path': 'patients', 'title': 'Patients', component: PatientsComponent },
    { 'path': 'patient/:patientId', 'title': 'Patient', component: PatientComponent },
    { 'path': 'login', 'title': 'Login', component: LoginComponent },
    { 'path': 'signup', 'title': 'SignUp', component: SignupComponent },
];
