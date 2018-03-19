import { Component, OnInit, ViewChild } from '@angular/core';
import { Response, ResponseContentType } from '@angular/http';
import { HttpClient, HttpHeaders, HttpParams,
  HttpResponse, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Router, ActivatedRoute, Params } from '@angular/router';

// Other Components
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  fireEvent(e){
    console.log(e.type);
  }

  resultError;

  constructor(
  ) {
  }

  ngOnInit() { 
    this.resultError=this.header.resultError;
  }
}
