import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core'
import {
  Disposition, FundingLine, Pom, POMService, ProgramsService, ShortyType, UFR,
  UFRsService, UfrStatus
} from '../../../../generated'
import {WithFullName, WithFullNameService} from "../../../../services/with-full-name.service";
import {ActivatedRoute} from "@angular/router";
import {HeaderComponent} from "../../../header/header.component";
import {DataRow} from "../../ufr-view/ufr-funds-tab/DataRow";
import {GridType} from "../../../programming/program-request/funds-tab/GridType";
import {AgGridNg2} from "ag-grid-angular";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {Notify} from "../../../../utils/Notify";

@Component({
  selector: 'ufr-approval-detail',
  templateUrl: './ufr-approval-detail.component.html',
  styleUrls: ['./ufr-approval-detail.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class UfrApprovalDetailComponent implements OnInit {

  @ViewChild(HeaderComponent) header;
  @ViewChild("agGridProposedChanges") private agGridProposedChanges: AgGridNg2;
  @ViewChild("agGridCurrentFunding") private agGridCurrentFunding: AgGridNg2;
  @ViewChild("agGridRevisedPrograms") private agGridRevisedPrograms: AgGridNg2;
  ufr: UFR;
  shorty: WithFullName;
  pom: Pom;
  requestNumber: string;
  nextUfrId;
  previousUfrId;

  columnKeys;
  defaultColumnDefs = [];

  proposedChange;
  revisedPrograms;
  currentFunding;

  currentFundingColumnDefs = [];
  proposedChangesColumnDefs = [];
  revisedProgramsColumnDefs = [];

  Disposition = Disposition;
  UfrStatus = UfrStatus;

  constructor(private withFullNameService: WithFullNameService,
              private pomService: POMService,
              private programService: ProgramsService,
              private route: ActivatedRoute,
              private ufrService: UFRsService) {}

  async ngOnInit() {
    let ufrId;
    this.route.params.subscribe(async params => {
     ufrId = params['id'];
     await this.init(ufrId);
    });
  }

  async init(ufrId){
    await this.initUfr(ufrId);

    await this.initPom();

    await this.initShorty();

    this.generateColumns();

    await this.initCurrentFunding();

    await this.initProposedChanges();

    this.initRevisedChanges()

    this.setAlignedGrids();
  }

  async updateUfr(type: string){
    this.ufr = (await this.ufrService.generateTransaction(type, this.ufr).toPromise()).result;
    Notify.success('UFR ' + type + ' updated successfully');
  }

  async initCurrentFunding() {
    let data: Array<DataRow> = [];
    if (this.shorty) {
      this.shorty.fundingLines.forEach(fundingLine => {
        let pomRow: DataRow = {fundingLine: fundingLine,
          editable: false,
          gridType: GridType.CURRENT_PR}
        data.push(pomRow);
      });
    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())),
        editable: false,
        gridType: GridType.CURRENT_PR
      };
      data.push(pomRow);
    }

    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.currentFundingColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.currentFundingColumnDefs.unshift({
      colId: 'flType',
      valueGetter: () => {return 'Current Funding'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
      },
      cellClass: 'funding-line-default'
    });

    this.agGridCurrentFunding.api.setColumnDefs(this.currentFundingColumnDefs);
    this.currentFunding = data
    this.agGridCurrentFunding.api.setRowData(this.currentFunding);
  }

  async initProposedChanges() {
    let data: Array<DataRow> = [];
    this.ufr.fundingLines.forEach(fundingLine => {
      let pomRow: DataRow = {fundingLine: fundingLine,
        editable: true,
        gridType: GridType.CURRENT_PR}
      data.push(pomRow);
    });

    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.proposedChangesColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.proposedChangesColumnDefs.unshift({
      colId: 'flType',
      valueGetter: params => {return 'Proposed Change'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
      },
      cellClass: 'funding-line-default'
    });
    this.agGridProposedChanges.api.setColumnDefs(this.proposedChangesColumnDefs);
    this.proposedChange = data
    this.agGridProposedChanges.api.setRowData(this.proposedChange);
  }

  initRevisedChanges() {
    this.calculateRevisedChanges();
    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.revisedProgramsColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);
    this.revisedProgramsColumnDefs.unshift({
      colId: 'flType',
      //maxWidth: 122,
      valueGetter: () => {return 'Revised Program'},
      rowSpan: params => {return this.rowSpanCount(params)},
      cellClassRules: {
        'row-span': params => {return this.rowSpanCount(params) > 1}
      },
      cellClass: 'funding-line-default'
    });

    this.agGridRevisedPrograms.api.setColumnDefs(this.revisedProgramsColumnDefs);
  }

  calculateRevisedChanges() {
    let data: Array<DataRow> = [];
    if (this.ufr.fundingLines && this.ufr.fundingLines.length > 0) {
      this.proposedChange.forEach(pc => {
        let cf = this.currentFunding.find(cf => {
          return cf.fundingLine.appropriation === pc.fundingLine.appropriation &&
            cf.fundingLine.baOrBlin === pc.fundingLine.baOrBlin &&
            cf.fundingLine.opAgency === pc.fundingLine.opAgency &&
            cf.fundingLine.item === pc.fundingLine.item
        });
        let row: DataRow = JSON.parse(JSON.stringify(pc));
        row.editable = false;
        row.fundingLine.userCreated = false;
        row.gridType = GridType.CURRENT_PR;
        Object.keys(row.fundingLine.funds).forEach(year =>{
          row.fundingLine.funds[year] = (cf && cf.fundingLine.funds[year]? cf.fundingLine.funds[year] : 0) + (pc.fundingLine.funds[year]? pc.fundingLine.funds[year] : 0);
        });
        data.push(row);
      });
      this.revisedPrograms = data;
    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())),
        editable: false,
        gridType: GridType.CURRENT_PR};
      data.push(pomRow);
      this.revisedPrograms = data;
    }
    this.agGridRevisedPrograms.api.setRowData(this.revisedPrograms);
  }

  generateColumns() {
    this.defaultColumnDefs = [
      {
        headerName: 'Funds in $K',
        children: [
          {
            headerName: 'Appn',
            headerTooltip: 'Appropriation',
            field: 'fundingLine.appropriation',
            suppressToolPanel: true,
            maxWidth: 64,
            cellClass: 'funding-line-default'
          },
          {
            headerName: 'BA/BLIN',
            headerTooltip: 'BA/BLIN',
            field: 'fundingLine.baOrBlin',
            maxWidth: 70,
            suppressToolPanel: true,
            cellClass: 'funding-line-default'
          },
          {
            headerName: 'Item',
            headerTooltip: 'Item',
            field: 'fundingLine.item',
            maxWidth: 70,
            cellClass: 'funding-line-default'
          },
          {
            headerName: 'OpAgency',
            headerTooltip: 'OpAgency',
            field: 'fundingLine.opAgency',
            cellClass: 'funding-line-default',
            hide: true
          }]}
    ];

    this.columnKeys.forEach(key => {

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
        case this.pom.fy - 1:
          subHeader = 'CY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pom.fy - 2:
          subHeader = 'PY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pom.fy -3:
          subHeader = 'PY-1';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
      }
      if (subHeader) {
        let columnKey = key.toString().replace('20', 'FY')
        let colDef = {
          headerName: subHeader,
          suppressToolPanel: true,
          children: [{
            headerName: columnKey,
            colId: key,
            headerTooltip: 'Fiscal Year ' + key,
            field: 'fundingLine.funds.' + key,
            maxWidth: 90,
            suppressMenu: true,
            suppressToolPanel: true,
            type: "numericColumn",
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params)
            }
          }]
        };
        this.defaultColumnDefs.push(colDef);
      }
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      headerTooltip: 'Future Years Defense Program Total',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 90,
      cellClass:['text-right'],
      cellEditor: 'numericCellEditor',
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(totalColDef);

    let ctcColDef = {
      headerName: 'CTC',
      headerTooltip: 'Cost to Complete',
      suppressMenu: true,
      suppressToolPanel: true,
      maxWidth: 90,
      field: 'fundingLine.ctc',
      cellClass:['text-right'],
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(ctcColDef);
  }

  setAlignedGrids() {
    this.agGridProposedChanges.gridOptions.alignedGrids = [];
    this.agGridProposedChanges.gridOptions.alignedGrids.push(this.agGridCurrentFunding.gridOptions);
    this.agGridProposedChanges.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);

    this.agGridCurrentFunding.gridOptions.alignedGrids = [];
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridProposedChanges.gridOptions);
    this.agGridCurrentFunding.gridOptions.alignedGrids.push(this.agGridRevisedPrograms.gridOptions);

    this.agGridRevisedPrograms.gridOptions.alignedGrids = [];
    this.agGridRevisedPrograms.gridOptions.alignedGrids.push(this.agGridProposedChanges.gridOptions);
    this.agGridRevisedPrograms.gridOptions.alignedGrids.push(this.agGridCurrentFunding.gridOptions);
  }

  rowSpanCount(params){
    if(params.node.rowIndex === 0){
      return params.api.getDisplayedRowCount();
    } else {
      return 1;
    }
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if(year >= this.pom.fy) {
        let amount = pr.fundingLine.funds[year];
        result += isNaN(amount)? 0 : amount;
      }
    });
    return result;
  }

  async initPom(){
    let pomResponse = (await this.pomService.getById(this.ufr.phaseId).toPromise());
    this.pom = pomResponse.result;
    this.columnKeys = [
      this.pom.fy - 3,
      this.pom.fy -2,
      this.pom.fy - 1,
      this.pom.fy,
      this.pom.fy + 1,
      this.pom.fy + 2,
      this.pom.fy + 3,
      this.pom.fy + 4];

    const sequentialNumber = ('000' + this.ufr.requestNumber).slice(-3);
    this.requestNumber = (this.pom.fy - 2000)+ sequentialNumber;

    let ufrNextResponse = (await this.ufrService.getNext(this.ufr.requestNumber).toPromise());
    if(ufrNextResponse.result !== null) {
      this.nextUfrId = ufrNextResponse.result.id;
    } else {
      this.nextUfrId = null;
    }

    let ufrPreviousResponse = (await this.ufrService.getPrevious(this.ufr.requestNumber).toPromise());
    if(ufrPreviousResponse.result !== null) {
      this.previousUfrId = ufrPreviousResponse.result.id;
    } else {
      this.previousUfrId = null;
    }
  }

  async initUfr(ufrId){
    this.ufr = (await this.ufrService.getUfrById(ufrId).toPromise()).result;
  }

  async initShorty() {
    if( this.ufr.shortyType == ShortyType.MRDB_PROGRAM ||
      this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType == ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ) {
      this.shorty = await this.withFullNameService.program(this.ufr.shortyId);
    } else if( this.ufr.shortyType == ShortyType.PR ||
      this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR ||
      this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR ) {
      this.shorty = await this.withFullNameService.programRequest(this.pom.id, this.ufr.shortyId);
    } else { // this.ufr.shortyType == ShortyType.NEW_PROGRAM
      // leave this.shorty null
    }
  }

  generateEmptyFundingLine(pomFundingLine?: FundingLine): FundingLine{
    let funds = {};
    this.columnKeys.forEach(key => {
      funds[key] = 0;
    });
    let emptyFundingLine: FundingLine = {
      acquisitionType: null,
      appropriation: null,
      baOrBlin: null,
      funds: funds,
      id: null,
      item: null,
      opAgency: null,
      programElement: null,
      variants: []
    };
    if(pomFundingLine){
      emptyFundingLine.appropriation = pomFundingLine.appropriation
      emptyFundingLine.item = pomFundingLine.item
      emptyFundingLine.opAgency = pomFundingLine.opAgency
      emptyFundingLine.baOrBlin = pomFundingLine.baOrBlin
      emptyFundingLine.userCreated = pomFundingLine.userCreated;
    } else {
      emptyFundingLine.userCreated = true
    }
    return emptyFundingLine;
  }

  sizeColumnsToFit(params){
    params.api.sizeColumnsToFit();
  }

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
}
