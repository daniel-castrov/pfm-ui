import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../header/j-header/j-header.component';

@Component({
  selector: 'app-p-forms',
  templateUrl: './p-forms.component.html',
  styleUrls: ['./p-forms.component.scss']
})
export class PFormsComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }
  
  ngOnInit() {
  }

}
