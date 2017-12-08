// app.modules  
// ANGULAR IMPORTS
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// COMPONENTS
import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ContactComponent } from './components/contact/contact.component';

import { FilterComponent } from './components/filter/filter.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NoopInterceptor } from './components/interceptors/noopInterceptor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { UserComponent } from './components/user/user.component';

// GENERATED APIs AND MODELS
import { BASE_PATH } from './generated/variables';
import { BlankApi } from './generated/api/BlankApi';
import { FundLineApi } from './generated/api/FundLineApi';
import { ProgramApi } from './generated';
import { TagApi } from './generated/api/TagApi';

// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},  
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'apply', component:ApplyComponent},
  {path:'contact', component:ContactComponent},  
  {path:'filter', component:FilterComponent},
  {path:'header', component:HeaderComponent},
  {path:'home', component:HomeComponent},  
  {path:'no-access', component:NoAccessComponent},
  {path:'not-found', component:NotFoundComponent},
  {path:'planning', component:PlanningComponent},
  {path:'programs', component:ProgramsComponent},  
  {path:'user/:id', component:UserComponent}
];

@NgModule({
  declarations: [
    AboutComponent,
    AboutPrivateComponent,
    AppComponent,
    ApplyComponent,
    ContactComponent,
    HeaderComponent,    
    HomeComponent,
    LoginComponent,    
    FilterComponent,
    NoAccessComponent,
    NotFoundComponent,    
    PlanningComponent,
    ProgramsComponent,        
    UserComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    NgbModule.forRoot(),    
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    BlankApi,
    FundLineApi,  
    ProgramApi, 
    TagApi, 
    // { provide: BASE_PATH, useValue: 'https://ec2-34-231-125-182.compute-1.amazonaws.com:8443/jscbis' }
    { provide: BASE_PATH, useValue: 'https://localhost:8445/jscbis' },
    { provide: HTTP_INTERCEPTORS, useClass: NoopInterceptor, multi: true, },
    
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
