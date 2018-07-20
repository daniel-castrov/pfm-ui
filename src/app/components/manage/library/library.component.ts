import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import {FileMetadata, LibraryService} from "../../../generated";
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

  data: Array<FileMetadata>;
  currentPage: number;
  totalPages: number;

  constructor(private libraryService: LibraryService) {}

  ngOnInit() {
    this.libraryService.getAll().subscribe(data => {
      this.data = data.result;
      this.agGrid.api.sizeColumnsToFit();
    })

  }

  columnDefs = [
    {headerName: 'File Name', valueGetter: 'data.metadata.Name'},
    {headerName: 'File Area', valueGetter: 'data.metadata.area'},
    {headerName: 'Date', valueGetter: 'data.metadata.IngestDate'},
    {headerName: 'Type', valueGetter: 'data.metadata.MimeType'},
    {headerName: '', cellRenderer: this.viewBtn}
  ];

  viewBtn(params) {
    return '<button class="btn btn-primary" (click)="onBtnView('+ params +')">View</button>'
  }

  onBtnView(params) {
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
