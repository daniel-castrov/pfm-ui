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

const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'home', component:HomeComponent},
  {path:'header', component:HeaderComponent},
  {path:'about', component:AboutComponent},
  {path:'apply', component:ApplyComponent},
  {path:'contact', component:ContactComponent},
  {path:'programs', component:ProgramsComponent},
  {path:'filter', component:FilterComponent}
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
    ApplyComponent,
    ContactComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot(),
    HttpModule
  ],
  providers: [
    ProgramApi,
    {  provide: BASE_PATH, useValue: 'http://ec2-34-231-125-182.compute-1.amazonaws.com:8080/jscbis' }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
