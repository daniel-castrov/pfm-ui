import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { UserComponent } from './components/user/user.component';
import { HeaderComponent } from './components/header/header.component';
import { ProgramsComponent } from './components/programs/programs.component';
import { FilterComponent } from './components/filter/filter.component';
import { ApplyComponent } from './components/apply/apply.component';

const appRoutes: Routes = [
  {path:'', component:HomeComponent},
  {path:'user/:id', component:UserComponent},
  {path:'header', component:HeaderComponent},
  {path:'apply', component:ApplyComponent},
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
    ApplyComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(appRoutes),
    NgbModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
