import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../../components/header/header.component';

@Component({
  selector: 'app-suspend-delete',
  templateUrl: './suspend-delete.component.html',
  styleUrls: ['./suspend-delete.component.css']
})

export class SuspendDeleteComponent implements OnInit {

  @ViewChild(HeaderComponent) header;

  constructor() { }

  ngOnInit() {
  }

}
