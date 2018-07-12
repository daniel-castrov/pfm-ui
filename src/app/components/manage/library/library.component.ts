import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
declare const $: any;

@Component({
  selector: 'library',
  templateUrl: './library.component.html',
  styleUrls: ['./library.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LibraryComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  data = [];
  currentPage: number;
  totalPages: number;

  constructor() {}

  ngOnInit() {}

  columnDefs = [
    {headerName: 'File Name', field: 'fileName'},
    {headerName: 'File Area', field: 'fileArea'},
    {headerName: '', cellRenderer: this.viewBtn}
  ];

  viewBtn(params) {
    return '<button class="btn btn-primary" (click)="onBtnView(params.fileName, params.fileArea)"/>'
  }

  onBtnView(fileName, fileArea) {
    //TODO: link to the file to either display online or download it
  }

  onBtnFirst() {
    this.agGrid.api.paginationGoToFirstPage();
  }

  onBtnLast() {
    this.agGrid.api.paginationGoToLastPage();
  }

  onBtnNext() {
    this.agGrid.api.paginationGoToNextPage();
  }

  onBtnPrevious() {
    this.agGrid.api.paginationGoToPreviousPage();
  }

  onPaginationChanged() {
    if (this.agGrid.api) {
      this.currentPage = this.agGrid.api.paginationGetCurrentPage() + 1;
      this.totalPages = this.agGrid.api.paginationGetTotalPages();
    }
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
