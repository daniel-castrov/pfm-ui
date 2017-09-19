import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {

  user = {
    firstname:'', 
    lastname:'',
    email:'',
    phone:''
}

onSubmit({value, valid}){
 if(valid){
     console.log(value);
 } else {
     console.log('Form is invalid');
 }
}

  constructor() { }

  ngOnInit() {
  }

}
