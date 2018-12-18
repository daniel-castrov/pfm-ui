import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';

@Component({
  selector: 'app-r-forms',
  templateUrl: './r-forms.component.html',
  styleUrls: ['./r-forms.component.scss']
})
export class RFormsComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
