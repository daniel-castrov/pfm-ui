import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { UserComponent } from '../user/user.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  fireEvent(e){
    //console.log('button clicked');
    console.log(e.type);
  }

  id: number;
  name:string;
  age:number;
  email:string;
  address:Address;

  constructor(
    private route:ActivatedRoute,
    private router:Router
  ) {
    this.route.params.subscribe((params:Params) => {
      // console.log(params);
      this.id = params.id;
    });
  }

  ngOnInit() {
    // console.log('OnInit ran...');
    this.name = 'Jane Doe';
    this.age = 30;
    this.email = 'janedoe@test.com';
    this.address = {
      street: '50 Main Street',
      city: 'Boston',
      state: 'MA'
    }
  }

  onClick(){
    // console.log('hello');
    this.name='Mike';
    }
}

interface Address{
  street:string,
  city:string,
  state:string
}
