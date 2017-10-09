import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})

export class UserComponent implements OnInit {
  id: number;
  name:string;
  age:number;
  email:string;
  address:Address;
  hobbies:string[];
  hello:string;

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
    this.name = 'Elmer Fudd';
    this.age = 35;
    this.email = 'gaby.campagna@p-exchange.com';
    this.address = {
      street: '50 Main Street',
      city: 'Boston',
      state: 'MA'
    }
    this.hobbies = ['pilates', 'travel', 'design', 'watch movies'];
    this.hello = 'hello';
  }

  onClick(){
    // console.log('hello');
    this.name='Mike';
    this.hobbies.push('New Hobby');
    }

    addHobby(hobby){
      // console.log(hobby);
      this.hobbies.unshift(hobby);
      return false;
    }

    deleteHobby(hobby){
      for(let i= 0;i < this.hobbies.length; i++){
        if(this.hobbies[i] == hobby){
          this.hobbies.splice(i, 1);
        }
      }
    }
}

interface Address{
  street:string,
  city:string,
  state:string
}
