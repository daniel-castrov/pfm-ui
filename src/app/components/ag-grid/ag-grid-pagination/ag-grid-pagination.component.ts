import {Component, Input, OnInit} from '@angular/core'

@Component({
  selector: 'ag-grid-pagination',
  templateUrl: './ag-grid-pagination.component.html'
})

export class AgGridPaginationComponent implements OnInit {

  @Input() agGrid;
  currentPage;
  totalPages;
  showPagination;

  constructor() {}

  ngOnInit() {}

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
    if (this.agGrid) {
      this.showPagination = this.agGrid.api.getDisplayedRowCount() > this.agGrid.gridOptions.paginationPageSize;
      this.currentPage = this.agGrid.api.paginationGetCurrentPage() + 1;
      this.totalPages = this.agGrid.api.paginationGetTotalPages();
    }
  }
}
