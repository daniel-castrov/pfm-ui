import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  fireEvent(e){
    //console.log('button clicked');
    console.log(e.type);
  }

  id: number;

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
  }

}
