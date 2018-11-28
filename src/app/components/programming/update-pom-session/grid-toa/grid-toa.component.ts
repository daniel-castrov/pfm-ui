import {Component, Input, ViewChild, ViewEncapsulation} from '@angular/core';
import {Pom, TOA, User, Worksheet, WorksheetRow} from "../../../../generated";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";


@Component({
  selector: 'grid-toa',
  templateUrl: './grid-toa.component.html',
  styleUrls: ['./grid-toa.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class GridToaComponent {

  @ViewChild("agGridToa") private agGridToa: AgGridNg2;

  @Input() pom: Pom;
  user: User;
  columnDefs;
  toaColumnDefs;
  @Input() columnKeys;
  rowData;
  toaRowData;
  @Input() selectedWorksheet: Worksheet;

  initToaDataRows(){
    let data: Array<any> = [];
    let allocatedFunds = [];
    this.pom.communityToas.forEach((toa: TOA) => {
      allocatedFunds[toa.year] = toa.amount;
    });

    let allocatedRow = {description: 'Allocated TOA', funds: allocatedFunds, modified: false};
    data.push(allocatedRow);

    let resourcedFunds = [];
    this.columnKeys.forEach((year: number) => {
      resourcedFunds[year] = 0;
    });
    this.selectedWorksheet.rows.forEach((value: WorksheetRow) => {
      this.columnKeys.forEach((year: number) => {
        if(year >= this.pom.fy) {
          let amount = value.fundingLine.funds[year];
          resourcedFunds[year] += isNaN(amount)? 0 : amount;
        }
      });
    });

    let resourcedRow = {description: 'Total Resourced', funds: resourcedFunds, modified: false};
    data.push(resourcedRow);

    let deltaFunds = [];
    this.columnKeys.forEach((year: number) => {
      deltaFunds[year] = allocatedFunds[year] - resourcedFunds[year];
    });

    let deltaRow = {description: 'Delta', funds: deltaFunds};
    data.push(deltaRow);

    this.toaRowData = data;
    this.agGridToa.api.sizeColumnsToFit();
  }

  generateToaColumns() {
    this.toaColumnDefs = [
      {
        headerName: '',
        field: 'description',
        cellClass: ['ag-cell-white','text-right'],
        suppressMenu: true
      }
    ];
    this.columnKeys.forEach(key => {
      if (key >= this.pom.fy) {
        let columnKey = key.toString().replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          colId: key,
          headerTooltip: 'Fiscal Year ' + key,
          field: 'funds.' + key,
          maxWidth: 92,
          suppressMenu: true,
          cellClass: ['ag-cell-white','text-right'],
          valueFormatter: params => {
            return FormatterUtil.currencyFormatter(params, 0, true)
          },
          cellStyle: params => {
            if (params.data.funds[key] < 0) {
              return {color: 'red', 'font-weight': 'bold'};
            };
          }
        };
        this.toaColumnDefs.push(colDef);
      }
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 100,
      minWidth: 100,
      cellClass: ['ag-cell-white','text-right'],
      valueGetter: params => {return this.getTotalToa(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params, 0, true)},
      cellStyle: params => {
        if (this.getTotalToa(params.data, this.columnKeys) < 0) {
          return {color: 'red', 'font-weight': 'bold'};
        };
      }
    };
    this.toaColumnDefs.push(totalColDef);

    this.agGridToa.api.setColumnDefs(this.toaColumnDefs);
    this.agGridToa.api.sizeColumnsToFit();
  }

  getTotalToa(row, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.pom.fy) {
        let amount = row.funds[year];
        result += isNaN(amount)? 0 : Number(amount);
      }
    });
    return result;
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    });
    window.addEventListener("resize", () => {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }
}