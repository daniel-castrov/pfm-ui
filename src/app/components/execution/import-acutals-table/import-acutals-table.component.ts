import { Component, OnInit, ViewChild, Input } from '@angular/core';

// Other Components
import { GridOptions } from 'ag-grid';
import { AgGridNg2 } from 'ag-grid-angular';
import { FileMetadata, LibraryService, FileResponse } from '../../../generated';
import { LibraryViewCellRenderer } from '../../renderers/library-view-cell-renderer/library-view-cell-renderer.component';

@Component({
  selector: 'import-acutals-table',
  templateUrl: './import-acutals-table.component.html',
  styleUrls: ['./import-acutals-table.component.scss']
})
export class ImportAcutalsTableComponent implements OnInit {
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @Input() data: FileMetadata[];
  private agOptions: GridOptions;
  private frameworkComponents = { lvcr: LibraryViewCellRenderer };
  private context = { parentComponent: this };

  private columnDefs = [
    {
      headerName: 'Date',
      field: 'metadata.IngestDate'
    },
    {
      headerName: 'File',
      field: 'metadata.Name'
    },
    {
      headerName: 'Status',
      field: 'metadata.status'
    },
    {
      headerName: 'Uploaded by',
      field: 'metadata.creator'
    },
    {
      headerName: 'Action',
      width: 30,
      field: 'metadata.id',
      autoHeight: true,
      cellRenderer: 'lvcr',
      suppressMenu: true,
      cellStyle: { 'text-align': 'center' }
    }
  ];

  constructor( private library: LibraryService ) { 
  }

  ngOnInit() { }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener("resize", function() {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  openFile(fileId, fileArea) {
    this.library.downloadFile(fileId, fileArea).subscribe(response => {
      if (response.result) {
        let fileResponse = response.result as FileResponse;
        this.convertAndOpen(fileResponse.content, fileResponse.contentType);
      }
    });
  }

  convertAndOpen(content, type) {
    var byteCharacters = atob(content);
    var byteNumbers = new Array(byteCharacters.length);
    for (var i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    var byteArray = new Uint8Array(byteNumbers);
    var blob = new Blob([byteArray], { type: type });

    var url = window.URL.createObjectURL(blob);
    window.open(url);
  }
}
