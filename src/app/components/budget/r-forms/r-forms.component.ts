import { Component, OnInit, ViewChild } from '@angular/core';
import { JHeaderComponent } from '../../header/j-header/j-header.component';

@Component({
  selector: 'app-r-forms',
  templateUrl: './r-forms.component.html',
  styleUrls: ['./r-forms.component.scss']
})
export class RFormsComponent implements OnInit {

  @ViewChild(JHeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
