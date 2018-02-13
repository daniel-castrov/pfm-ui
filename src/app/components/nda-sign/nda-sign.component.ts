import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-nda-sign',
  templateUrl: './nda-sign.component.html',
  styleUrls: ['./nda-sign.component.css']
})
export class NdaSignComponent implements OnInit {

    nda = {
      accept:'',
      decline:''
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
