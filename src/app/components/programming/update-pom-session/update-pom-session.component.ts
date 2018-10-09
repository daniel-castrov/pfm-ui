import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import {Pom, POMService, TOA, Worksheet, WorksheetRow, WorksheetService} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {FormatterUtil} from "../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {CellEditor} from "../../../utils/CellEditor";
import {NotifyUtil} from "../../../utils/NotifyUtil";

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  @ViewChild("agGridToa") private agGridToa: AgGridNg2;

  pom: Pom;
  columnDefs;
  toaColumnDefs;
  columnKeys;
  rowData;
  toaRowData;
  filterText;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet = null;
  components = { numericCellEditor: CellEditor.getNumericCellEditor() };

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService) { }

  ngOnInit() {
    this.userUtils.user().subscribe( user => {
      this.pomService.getOpen(user.currentCommunityId).subscribe( pom => {
        this.pom = pom.result;
        this.columnKeys = [
          this.pom.fy - 3,
          this.pom.fy -2,
          this.pom.fy - 1,
          this.pom.fy,
          this.pom.fy + 1,
          this.pom.fy + 2,
          this.pom.fy + 3,
          this.pom.fy + 4];
        this.worksheetService.getByPomId(pom.result.id).subscribe( worksheets => {
          this.worksheets = worksheets.result;
        });
      });
    });
  }

  update(){
    this.worksheetService.updateRows(this.selectedWorksheet).subscribe(response => {
      if (!response.error) {
        NotifyUtil.notifySuccess('Worksheet updated successfully');
      } else {
        NotifyUtil.notifyError('Something went wrong while trying to update the worksheet');
        console.log(response.error);
      }
    });
  }

  onWorksheetSelected(){
    setTimeout(() => {
      this.initDataRows();
      this.generateColumns();

      this.initToaDataRows();
      this.generateToaColumns();
    });
  }

  onFilterTextBoxChanged() {
    this.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

  initDataRows(){
    let data: Array<any> = [];
    this.selectedWorksheet.rows.forEach((value: WorksheetRow) => {
      let row = {
        coreCapability: value.coreCapability,
        programId: value.programRequestFullname,
        fundingLine: value.fundingLine
      };
      data.push(row);
    });
    this.rowData = data;
    this.agGrid.api.sizeColumnsToFit();
  }

  initToaDataRows(){
    let data: Array<any> = [];
    let allocatedFunds = [];
    this.pom.communityToas.forEach((toa: TOA) => {
      allocatedFunds[toa.year] = toa.amount;
    });

    let allocatedRow = {description: 'Allocated TOA', funds: allocatedFunds};
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

    let resourcedRow = {description: 'Total Resourced', funds: resourcedFunds};
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
        cellClass: 'text-right'
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
          cellClass: ['text-right'],
          valueFormatter: params => {
            return FormatterUtil.currencyFormatter(params)
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
      cellClass: 'text-right',
      valueGetter: params => {return this.getTotalToa(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)},
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

  generateColumns() {
    this.columnDefs = [
      {
        headerName: 'Core Capability',
        headerTooltip: 'Core Capability',
        field: 'coreCapability',
        cellClass: 'funding-line-default'
      },
      {
        headerName: 'Program ID',
        headerTooltip: 'Program ID',
        colId: 'programId',
        field: 'programId',
        cellClass: 'funding-line-default'
      },
      {
        headerName: 'Appn',
        headerTooltip: 'Appropriation',
        field: 'fundingLine.appropriation',
        cellClass: 'funding-line-default',
      },
      {
        headerName: 'BA/BLIN',
        headerTooltip: 'BA/BLIN',
        field: 'fundingLine.baOrBlin',
        cellClass: 'funding-line-default',
      },
      {
        headerName: 'Item',
        headerTooltip: 'Item',
        field: 'fundingLine.item',
        cellClass: 'funding-line-default'
      },
      {
        headerName: 'OpAgency',
        headerTooltip: 'OpAgency',
        field: 'fundingLine.opAgency',
        hide: true,
        cellClass: 'funding-line-default',
      }];

    this.columnKeys.forEach(key => {
      if(key >= this.pom.fy){
        let subHeader;
        let cellClass = [];
        switch(Number(key)) {
          case (this.pom.fy + 4):
            subHeader = 'BY+4';
            cellClass = ['text-right'];
            break;
          case this.pom.fy + 3:
            subHeader = 'BY+3';
            cellClass = ['text-right'];
            break;
          case this.pom.fy + 2:
            subHeader = 'BY+2';
            cellClass = ['text-right'];
            break;
          case this.pom.fy + 1:
            subHeader = 'BY+1';
            cellClass = ['text-right'];
            break;
          case this.pom.fy:
            subHeader = 'BY';
            cellClass = ['text-right'];
            break;
        }
        if (subHeader) {
          let columnKey = key.toString().replace('20', 'FY')
          let colDef = {
            headerName: subHeader,
            type: "numericColumn",
            children: [{
              headerName: columnKey,
              colId: key,
              headerTooltip: 'Fiscal Year ' + key,
              field: 'fundingLine.funds.' + key,
              maxWidth: 92,
              suppressMenu: true,
              suppressToolPanel: true,
              cellEditor: 'numericCellEditor',
              cellClass: ['text-right', 'ag-cell-edit'],
              editable: true,
              valueFormatter: params => {
                return FormatterUtil.currencyFormatter(params)
              },
              onCellValueChanged: params => this.onBudgetYearValueChanged(params)
            }]
          };
          this.columnDefs.push(colDef);
        }
      }
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 100,
      minWidth: 100,
      cellClass: 'text-right',
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.columnDefs.push(totalColDef);

    this.agGrid.api.setColumnDefs(this.columnDefs);
    this.agGrid.api.sizeColumnsToFit();
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.colId;
    params.data.fundingLine.funds[year] = Number(params.newValue);
    this.initToaDataRows();
  }

  getTotal(row, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.pom.fy) {
        let amount = row.fundingLine.funds[year];
        result += isNaN(amount)? 0 : Number(amount);
      }
    });
    return result;
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
