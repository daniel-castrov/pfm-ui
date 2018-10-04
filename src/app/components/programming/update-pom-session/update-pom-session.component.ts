import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import {Pom, POMService, PomWorksheetService} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {PomWorksheet} from "../../../generated/model/pomWorksheet";
import {FormatterUtil} from "../../../utils/formatterUtil";
import {GridType} from "../program-request/funds-tab/GridType";
import {PhaseType} from "../select-program-request/UiProgrammaticRequest";
import {AgGridNg2} from "ag-grid-angular";
import {DataRow} from "../program-request/funds-tab/DataRow";
import {PomWorksheetRow} from "../../../generated/model/pomWorksheetRow";

@Component({
  selector: 'update-pom-session',
  templateUrl: './update-pom-session.component.html',
  styleUrls: ['./update-pom-session.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UpdatePomSessionComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGrid") private agGrid: AgGridNg2;

  fy: number;
  columnDefs;
  columnKeys;
  rowData;
  worksheets: Array<PomWorksheet>;
  selectedWorksheet: PomWorksheet = null;

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private pomWorksheetService: PomWorksheetService) { }

  ngOnInit() {
    this.userUtils.user().subscribe( user => {
      this.pomService.getOpen(user.currentCommunityId).subscribe( pom => {
        this.fy = pom.result.fy;
        this.columnKeys = [
          this.fy - 3,
          this.fy -2,
          this.fy - 1,
          this.fy,
          this.fy + 1,
          this.fy + 2,
          this.fy + 3,
          this.fy + 4];
        this.pomWorksheetService.getByPomId(pom.result.id).subscribe( worksheets => {
          this.worksheets = worksheets.result;
        });
      });
    });
  }

  onWorksheetSelected(){
    this.initDataRows();
    this.generateColumns();
  }

  initDataRows(){
    let data: Array<any> = [];
    this.selectedWorksheet.rows.forEach((value: PomWorksheetRow) => {
      let row = {
        coreCapability: value.coreCapability,
        programId: value.programRequestId,
        fundingLine: value.fund
      };
      data.push(row);
    });
    this.rowData = data;
    this.agGrid.api.sizeColumnsToFit();
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

      let subHeader;
      let cellClass = [];
      switch(Number(key)) {
        case (this.fy + 4):
          subHeader = 'BY+4';
          cellClass = ['text-right'];
          break;
        case this.fy + 3:
          subHeader = 'BY+3';
          cellClass = ['text-right'];
          break;
        case this.fy + 2:
          subHeader = 'BY+2';
          cellClass = ['text-right'];
          break;
        case this.fy + 1:
          subHeader = 'BY+1';
          cellClass = ['text-right'];
          break;
        case this.fy:
          subHeader = 'BY';
          cellClass = ['text-right'];
          break;
        case this.fy - 1:
          subHeader = 'CY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.fy - 2:
          subHeader = 'PY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.fy -3:
          subHeader = 'PY-1';
          cellClass = ['ag-cell-white', 'text-right'];
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
            }
          }]
        };
        this.columnDefs.push(colDef);
      }
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 92,
      cellClass: 'text-right',
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.columnDefs.push(totalColDef);

    this.agGrid.api.setColumnDefs(this.columnDefs);
    this.agGrid.api.sizeColumnsToFit();
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.fy) {
        let amount = pr.fundingLine.funds[year];
        result += isNaN(amount)? 0 : amount;
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
        this.agGrid.api.sizeColumnsToFit();
      });
    });
  }
}
