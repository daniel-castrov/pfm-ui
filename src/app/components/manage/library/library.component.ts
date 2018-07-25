import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import {FileMetadata, FileResponse, LibraryService} from "../../../generated";
import {DatePipe} from "@angular/common";
import {LibraryViewCellRenderer} from "../../renderers/library-view-cell-renderer/library-view-cell-renderer.component";
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

  datePipe: DatePipe = new DatePipe('en-US')
  data: Array<FileMetadata>;
  currentPage: number;
  totalPages: number;
  columnDefs= [];
  frameworkComponents = {libraryViewCellRenderer: LibraryViewCellRenderer};
  context = {parentComponent: this};

  constructor(private libraryService: LibraryService) {}

  ngOnInit() {
    this.columnDefs = [
      {
        headerName: 'File Area',
        valueGetter: params => this.areaGetter(params),
      },
      {
        headerName: 'File Name',
        valueGetter: 'data.metadata.Name'
      },
      {
        headerName: 'Date',
        width: 60,
        filter: 'agDateColumnFilter',
        valueFormatter: params => this.dateFormatter(params),
        valueGetter: 'data.metadata.IngestDate',
        filterParams:{
          comparator: function (filterValue, cellValue) {
            let cellDate = new Date(Date.parse(cellValue));
            cellDate.setHours(0,0,0,0)
            let filterDate = new Date(Date.parse(filterValue));
            if (filterDate.getTime() == cellDate.getTime()) {
              return 0;
            }
            if (cellDate < filterDate) {
              return -1;
            }
            if (cellDate > filterDate) {
              return 1;
            }
          }
        }
      },
      {
        headerName: 'Type',
        width: 30,
        autoHeight: true,
        cellRenderer: params => this.typeCellRenderer(params),
        cellStyle: {'text-align': 'center'}
      },
      {
        headerName: 'Action',
        width: 30,
        autoHeight: true,
        cellRenderer: 'libraryViewCellRenderer',
        cellStyle: {'text-align': 'center'}
      }
    ];
    this.libraryService.getAll().subscribe(data => {
      this.data = data.result;
      this.agGrid.api.sizeColumnsToFit();
    })
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  areaGetter(params) {
    switch(params.data.metadata.area) {
      case 'pr':
          return 'Program Request';
      case 'epp':
        return 'EPP';
      default:
        return params.data.metadata.area;
    }
  }

  typeCellRenderer(params){
    switch(params.data.metadata.MimeType) {
      case 'image/png':
      case 'image/jpeg':
        return '<i title="Image File" class="align-middle fa fa-file-image-o" style="font-size:20px"></i>'
      case 'application/pdf':
        return '<i title="PDF File" class="align-middle fa fa-file-pdf-o" style="font-size:20px"></i>'
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return '<i title="Excel File" class="align-middle fa fa-file-excel-o" style="font-size:20px"></i>'
      default:
        return '<i title="Unknown File" class="align-middle fa fa-file-o" style="font-size:20px"></i>'
    }
  }

  dateFormatter(params){
    let dateFormat = 'dd/MM/yyyy hh:mm:ss a';
    let parsedDate = Date.parse(params.value);
    return this.datePipe.transform(parsedDate, dateFormat);
  }

  openFile(fileId, fileArea) {
    this.libraryService.downloadFile(fileId, fileArea).subscribe(response => {
      if (response.result) {
        let fileResponse = response.result as FileResponse;
        let filePath = 'data:'+ fileResponse.contentType +';base64,'  + fileResponse.content;
        var win = window.open();
        win.document.write('<iframe src="' + filePath  + '" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%; margin: -8px!important;" allowfullscreen></iframe>');
      }
    });
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
