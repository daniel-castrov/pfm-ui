import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})

export class HeaderComponent implements OnInit {

  @Input() public title: string;
  @Input() public isUserLoggedIn: boolean;

  id: number;
  name:string;

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

  }
}
