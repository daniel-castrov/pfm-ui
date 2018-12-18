import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-p-forms',
  templateUrl: './p-forms.component.html',
  styleUrls: ['./p-forms.component.scss']
})
export class PFormsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }
  
  ngOnInit() {
  }

}
