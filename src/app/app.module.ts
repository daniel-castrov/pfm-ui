import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpModule } from '@angular/http';
import { ProgramApi } from './generated';
import { BASE_PATH } from './generated/variables';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/user/user.component';
import { HeaderComponent } from './components/header/header.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { FilterComponent } from './components/filter/filter.component';
import { AboutComponent } from './components/about/about.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ContactComponent } from './components/contact/contact.component';
import { LoginComponent } from './components/login/login.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NComponent } from './components/n/n.component';

const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'home', component:HomeComponent},
  {path:'header', component:HeaderComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'apply', component:ApplyComponent},
  {path:'contact', component:ContactComponent},
  {path:'programs', component:ProgramsComponent},
  {path:'user/:id', component:UserComponent},
  {path:'filter', component:FilterComponent},
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent}
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    UserComponent,
    HeaderComponent,
    ProgramsComponent,
    FilterComponent,
    AboutComponent,
    AboutPrivateComponent,
    ApplyComponent,
    ContactComponent,
    LoginComponent,
    AboutPrivateComponent,
    NotFoundComponent,
    NoAccessComponent,
    NComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    HttpModule
  ],
  // providers: [
  //   ProgramApi,
  //   {  provide: BASE_PATH, useValue: 'http://ec2-34-231-125-182.compute-1.amazonaws.com:8080/jscbis' }
  // ],
  providers: [
    ProgramApi,
    {  provide: BASE_PATH, useValue: 'https://ec2-34-231-125-182.compute-1.amazonaws.com/jscbis' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
