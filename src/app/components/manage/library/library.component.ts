import { Component, OnInit, ViewChild } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {AgGridNg2} from 'ag-grid-angular';

// Other Components
import { HeaderComponent } from '../../header/header.component';
import {FileMetadata, FileResponse, LibraryService} from "../../../generated";
import {LibraryViewCellRenderer} from "../../renderers/library-view-cell-renderer/library-view-cell-renderer.component";
import {FormatterUtil} from "../../../utils/formatterUtil";
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
  columnDefs= [];
  frameworkComponents = {libraryViewCellRenderer: LibraryViewCellRenderer};
  context = {parentComponent: this};
  menuTabs = ['filterMenuTab'];

  constructor(private libraryService: LibraryService) {}

  ngOnInit() {
    this.columnDefs = [
      {
        headerName: 'File Area',
        filter: 'agTextColumnFilter',
        valueGetter: params => this.areaGetter(params),
        menuTabs: this.menuTabs,
      },
      {
        headerName: 'File Name',
        filter: 'agTextColumnFilter',
        menuTabs: this.menuTabs,
        valueGetter: 'data.metadata.Name'
      },
      {
        headerName: 'Date',
        menuTabs: this.menuTabs,
        width: 60,
        filter: 'agDateColumnFilter',
        valueFormatter: params => FormatterUtil.dateFormatter(params),
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
        suppressMenu: true,
        cellStyle: {'text-align': 'center'}
      },
      {
        headerName: 'Action',
        width: 30,
        autoHeight: true,
        cellRenderer: 'libraryViewCellRenderer',
        suppressMenu: true,
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

  openFile(fileId, fileArea) {
    this.libraryService.downloadFile(fileId, fileArea).subscribe(response => {
      if (response.result) {
        let fileResponse = response.result as FileResponse;
        this.convertAndOpen(fileResponse.content, fileResponse.contentType);
      }
    });
  }

  convertAndOpen(content, type){
    var byteCharacters = atob(content);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], {type: type});

    var url= window.URL.createObjectURL(blob);
    window.open(url);
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }
}
