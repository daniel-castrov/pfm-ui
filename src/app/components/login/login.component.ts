import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

// Other Components
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})

export class LoginComponent {
    constructor(private router: Router){
    }

    public onLoginClick(){
        this.router.navigate(['./home']);
    }
}
