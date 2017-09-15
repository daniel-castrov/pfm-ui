import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  id: number;
  name: any;
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
