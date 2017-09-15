import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-programs',
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.css']
})
export class ProgramsComponent {

  fireEvent(e){
    //console.log('button clicked');
    console.log(e.type);
  }

  constructor() { }

  ngOnInit() {
  }

}
