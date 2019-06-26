import {Component, Input, OnChanges, SimpleChange, ViewChild} from '@angular/core';
import {
  R3Entry,
  ProgramService,
  FundingLine,
} from '../../../../../generated';
import {RdteProgramContextService} from '../../rdte-program-context.service';
import {CurrentPhase} from '../../../../../services/current-phase.service';
import {Notify} from '../../../../../utils/Notify';
import {AgGridNg2} from 'ag-grid-angular';
import {FormatterUtil} from '../../../../../utils/formatterUtil';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'r3-summary',
  templateUrl: './r3-summary.component.html',
  styleUrls: ['./r3-summary.component.scss']
})
export class R3SummaryComponent implements OnChanges {

  @Input() entries: R3Entry[];
  @ViewChild('agGrid') private agGrid: AgGridNg2;

  by: number;
  fundingLine: FundingLine;
  rowsData: any[];
  deltaRow: any[];
  colDefs;
  agOptions: GridOptions;

  constructor(private rdteProgramContextService: RdteProgramContextService,
              private currentPhase: CurrentPhase) {
    this.agOptions = <GridOptions>{
      suppressDragLeaveHidesColumns: true,
      suppressMovableColumns: true
    }
  }

  async ngOnChanges() {
    await this.initProgramData();
    this.initColumnDefs();
    this.populateRowData();
  }

  initColumnDefs() {
    const columnDefs = [
      {
        headerName: 'Summary Allocation',
        field: 'allocation',
        editable: false,
        width: 204,
        maxWidth: 204,
        minWidth: 204,
        suppressMenu: true,
        cellStyle: {'text-align': 'left'},
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }, {
        headerName: 'FY' + (this.by - 2002).toString(),
        field: (this.by - 2002).toString(),
        type: 'numericColumn',
        editable: false,
        width: 104,
        maxWidth: 104,
        minWidth: 104,
        suppressMenu: true,
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params)
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }, {
        headerName: 'FY' + (this.by - 2001).toString(),
        field: (this.by - 2001).toString(),
        type: 'numericColumn',
        editable: false,
        width: 104,
        maxWidth: 104,
        minWidth: 104,
        suppressMenu: true,
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params)
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }, {
        headerName: 'FY' + (this.by - 2000).toString(),
        field: (this.by - 2000).toString(),
        type: 'numericColumn',
        editable: false,
        width: 104,
        maxWidth: 104,
        minWidth: 104,
        suppressMenu: true,
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params)
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }, {
        headerName: 'Total',
        field: 'total',
        type: 'numericColumn',
        editable: false,
        width: 104,
        maxWidth: 104,
        minWidth: 104,
        suppressMenu: true,
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params)
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }, {
        headerName: '% of TOA',
        field: 'pctToa',
        type: 'numericColumn',
        editable: false,
        width: 104,
        maxWidth: 104,
        minWidth: 104,
        suppressMenu: true,
        valueFormatter: params => {
          return FormatterUtil.percentageFormatter(params.value, 1);
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.allocation === 'Delta';
          }
        }
      }];
    this.colDefs = columnDefs;
    this.sizeColumnsToFit();
  }

  populateRowData() {

    let rowdata: any[] = [];

    let row = new Object();
    row['allocation'] = 'TOA';
    row[(this.by - 2002).toString()] = this.fundingLine.funds[this.by - 2];
    row[(this.by - 2001).toString()] = this.fundingLine.funds[this.by - 1];
    row[(this.by - 2000).toString()] = this.fundingLine.funds[this.by];
    let flTotal = this.fundingLine.funds[this.by - 2] + this.fundingLine.funds[this.by - 1] + this.fundingLine.funds[this.by];
    row['total'] = flTotal;
    row['pctToa'] = flTotal / flTotal;
    rowdata.push(row);

    row = new Object();
    row['allocation'] = 'Product Development';
    let grpPD:number[] = this.getEntryData('Product Development');

    row[(this.by - 2002).toString()] = grpPD[0];
    row[(this.by - 2001).toString()] = grpPD[1];
    row[(this.by - 2000).toString()] = grpPD[2];
    let totalPD = grpPD[0] + grpPD[1] + grpPD[2];
    row['total'] = totalPD;
    row['pctToa'] = totalPD / flTotal;
    rowdata.push(row);

    row = new Object();
    let grpSP:number[] = this.getEntryData('Support');
    row['allocation'] = 'Support';
    row[(this.by - 2002).toString()] = grpSP[0];
    row[(this.by - 2001).toString()] = grpSP[1];
    row[(this.by - 2000).toString()] = grpSP[2];
    let totalSP = grpSP[0] + grpSP[1] + grpSP[2];
    row['total'] = totalSP;
    row['pctToa'] = totalSP / flTotal;
    rowdata.push(row);

    row = new Object();
    let grpTE = this.getEntryData('Test & Evaluation');
    row['allocation'] = 'Test & Evaluation';
    row[(this.by - 2002).toString()] = grpTE[0];
    row[(this.by - 2001).toString()] = grpTE[1];
    row[(this.by - 2000).toString()] = grpTE[2];
    let totalTE = grpTE[0] + grpTE[1] + grpTE[2];
    row['total'] = totalTE;
    row['pctToa'] = totalTE / flTotal;
    rowdata.push(row);

    row = new Object();
    let grpMG = this.getEntryData('Management');
    row['allocation'] = 'Management';
    row[(this.by - 2002).toString()] = grpMG[0];
    row[(this.by - 2001).toString()] = grpMG[1];
    row[(this.by - 2000).toString()] = grpMG[2];
    let totalMG = grpMG[0] + grpMG[1] + grpMG[2];
    row['total'] = totalMG;
    row['pctToa'] = totalMG / flTotal;
    rowdata.push(row);

    row = new Object();
    row['allocation'] = 'Delta';
    row[(this.by - 2002).toString()] = this.fundingLine.funds[this.by - 2] - (grpPD[0] + grpSP[0] + grpTE[0] + grpMG[0]);
    row[(this.by - 2001).toString()] = this.fundingLine.funds[this.by - 1] - (grpPD[1] + grpSP[1] + grpTE[1] + grpMG[1]);
    row[(this.by - 2000).toString()] = this.fundingLine.funds[this.by - 0] - (grpPD[2] + grpSP[2] + grpTE[2] + grpMG[2]);
    let totalDelta = flTotal - (totalPD + totalSP + totalTE + totalMG);
    row['total'] = totalDelta;
    row['pctToa'] = totalDelta / flTotal;
    this.deltaRow = [row];

    this.rowsData = rowdata;
  }

  async initProgramData() {

    this.by = (await this.currentPhase.budget().toPromise()).fy;
    const fundingLines: FundingLine[] = this.rdteProgramContextService.program().fundingLines.filter(fl =>
      fl.baOrBlin === this.rdteProgramContextService.ba() &&
      fl.programElement === this.rdteProgramContextService.pe() &&
      fl.item === this.rdteProgramContextService.item()
    );

    if (fundingLines[0]) {
      this.fundingLine = fundingLines[0];
    } else {
      Notify.warning('FundingLine with Item: ' + this.rdteProgramContextService.item() + ' was not found for this program.');
    }
  }

  getEntryData(group: string): number[] {

    let values: number[] = [];
    const pdEntries = this.entries.filter(entry => entry.group == group);
    values.push( pdEntries.reduce((accumulator, currentValue) => accumulator + currentValue.pyCost, 0));
    values.push( pdEntries.reduce((accumulator, currentValue) => accumulator + currentValue.cyCost, 0));
    values.push( pdEntries.reduce((accumulator, currentValue) => accumulator + currentValue.byCost, 0));
    return values;
  }

  onGridReady(params) {
    setTimeout(() => {
      params.api.sizeColumnsToFit();
    }, 500);
    window.addEventListener('resize', function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  sizeColumnsToFit() {
    this.agGrid.api.sizeColumnsToFit();
  }

  invalid(): boolean {
    return this.deltaRow[0]['total'] !== 0;
  }

}
