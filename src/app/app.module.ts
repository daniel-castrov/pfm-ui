// app.modules
// ANGULAR IMPORTS
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// COMPONENTS
import { AboutComponent } from './components/about/about.component';
import { AboutPrivateComponent } from './components/about-private/about-private.component';
import { AppComponent } from './app.component';
import { ApplyComponent } from './components/apply/apply.component';
import { ContactComponent } from './components/contact/contact.component';
import { CreateCommunityComponent } from './components/create-community/create-community.component';
import { FilterComponent } from './components/filter/filter.component';
import { HeaderComponent } from './components/header/header.component';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { NoAccessComponent } from './components/no-access/no-access.component';
import { NoAccessInterceptor } from './components/interceptors/noAccessInterceptor.component';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { PlanningComponent } from './components/planning/planning.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { UserComponent } from './components/user/user.component';

// GENERATED APIs AND MODELS
import { BASE_PATH } from './generated/variables';
import { BlankService } from './generated/api/blank.service';
import { CommunityService } from './generated/api/community.service';
import { FundLineService } from './generated/api/fundLine.service';
import { ProgramService } from './generated/api/program.service';
import { TagService } from './generated/api/tag.service';
import { UserDetailsService } from './generated/api/userDetails.service';

// ROUTES
const appRoutes: Routes = [
  {path:'', component:LoginComponent},
  {path:'about', component:AboutComponent},
  {path:'about-private', component:AboutPrivateComponent},
  {path:'apply', component:ApplyComponent},
  {path:'create-community', component:CreateCommunityComponent},
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
    CreateCommunityComponent,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    FilterComponent,
    NoAccessComponent,
    NotFoundComponent,
    PlanningComponent,
    ProgramsComponent,
    UserComponent,

  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    NgbModule.forRoot(),
    RouterModule.forRoot(appRoutes),
  ],
  providers: [
    BlankService,
    CommunityService,
    FundLineService,
    ProgramService,
    TagService,
    UserDetailsService,
    //{ provide: BASE_PATH, useValue: 'https://ec2-34-231-125-182.compute-1.amazonaws.com:8443/jscbis' },
    { provide: BASE_PATH, useValue: 'https://localhost:8445/jscbis' },
    { provide: HTTP_INTERCEPTORS, useClass: NoAccessInterceptor, multi: true, },

  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
