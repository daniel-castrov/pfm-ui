import {Component, OnInit, ViewChild, ViewEncapsulation} from '@angular/core'
import {
  Disposition, FundingLine, Pom, POMService, Program, ProgramsService, PRService, ShortyType, UFR, UfrEvent,
  UFRsService, UfrStatus, User, UserService, Worksheet, WorksheetEvent, WorksheetRow, WorksheetService
} from '../../../../generated'
import {ProgramAndPrService} from "../../../../services/program-and-pr.service";
import {ActivatedRoute} from "@angular/router";
import {HeaderComponent} from "../../../header/header.component";
import {DataRow} from "../../ufr-view/ufr-funds-tab/DataRow";
import {GridType} from "../../../programming/program-request/funds-tab/GridType";
import {AgGridNg2} from "ag-grid-angular";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {Notify} from "../../../../utils/Notify";
import {RowUpdateEventData} from "../../../../generated/model/rowUpdateEventData";

declare const $: any;

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
  @ViewChild("agGridTransactions") private agGridTransactions: AgGridNg2;

  @ViewChild("agGridProposedChangesModal") private agGridProposedChangesModal: AgGridNg2;
  @ViewChild("agGridCurrentFundingModal") private agGridCurrentFundingModal: AgGridNg2;
  @ViewChild("agGridRevisedProgramsModal") private agGridRevisedProgramsModal: AgGridNg2;

  ufr: UFR;
  shorty: Program;
  pom: Pom;
  requestNumber: string;
  nextUfrId;
  previousUfrId;

  columnKeys;
  defaultColumnDefs = [];

  proposedChange;
  partiallyApproved;
  revisedPrograms;
  revisedProgramsModal;
  currentFunding;
  transactions;

  currentFundingColumnDefs = [];
  proposedChangesColumnDefs = [];
  partiallyApprovedColumnDefs = [];
  revisedProgramsColumnDefs = [];

  Disposition = Disposition;
  UfrStatus = UfrStatus;

  worksheets: Worksheet[];
  isDispositionAvailable;
  components = { numericCellEditor: this.getNumericCellEditor() };


  constructor(private programAndPrService: ProgramAndPrService,
              private worksheetService: WorksheetService,
              private pomService: POMService,
              private programService: ProgramsService,
              private prService: PRService,
              private route: ActivatedRoute,
              private ufrService: UFRsService,
              private userService: UserService) {}

  async ngOnInit() {
    let ufrId;
    this.route.params.subscribe(async params => {
      this.ufr = null;
      this.shorty = null;
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

    await this.initTransactions();

    this.determineDispositionAvailability();
  }

  determineDispositionAvailability(){
    this.worksheetService.getByPomId(this.pom.id).subscribe(response => {
      this.worksheets = response.result;
      this.isDispositionAvailable = !this.worksheets.some(ws => ws.locked);
    });
  }

  async updateUfr(type: string){
    if(type === 'disposition'){
      switch(this.ufr.disposition) {
        case Disposition.APPROVED:
          if(this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
            this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
            this.ufr.shortyType === ShortyType.MRDB_PROGRAM ||
            this.ufr.shortyType === ShortyType.NEW_PROGRAM) {
            let pr =  (await this.prService.createFromUfr({ufr: this.ufr, fundingLines: null}).toPromise()).result;
            pr.fundingLines.forEach(async fl => {
              this.worksheets.forEach(async ws => {
                let row =ws.rows.find(r  => r.fundingLine.id === fl.id);
                if (!row) {
                  let worksheetRow: WorksheetRow = {
                    programRequestId: pr.id,
                    programRequest: pr.shortName,
                    coreCapability: pr.coreCapability,
                    appropriation: fl.appropriation,
                    baOrBlin: fl.baOrBlin,
                    item: fl.item,
                    fundingLine: fl};
                  ws.rows.push(worksheetRow);
                } else {
                  Object.keys(row.fundingLine.funds).forEach(year => {
                    row.fundingLine.funds[year] += Number(fl.funds[year]);
                  });
                }
                await this.worksheetService.update({...ws}).toPromise();
              });
            })
          } else {
            this.ufr.fundingLines.forEach(async fl => {
              this.worksheets.forEach(async ws => {
                let row = ws.rows.find(r  => r.fundingLine.id === fl.id);
                if (!row) {
                  let worksheetRow: WorksheetRow = {
                    programRequestId: this.ufr.shortyId,
                    programRequest: this.ufr.shortName,
                    coreCapability: this.ufr.coreCapability,
                    appropriation: fl.appropriation,
                    baOrBlin: fl.baOrBlin,
                    item: fl.item,
                    fundingLine: fl};
                  ws.rows.push(worksheetRow);
                } else {
                  Object.keys(row.fundingLine.funds).forEach(year => {
                    row.fundingLine.funds[year] += Number(fl.funds[year]);
                  });
                }
                await this.worksheetService.update({...ws}).toPromise();
              });
            })
          }
          this.ufr = (await this.ufrService.generateTransaction(type, this.ufr).toPromise()).result;
          await this.initTransactions();
          Notify.success('UFR ' + type + ' updated successfully');
          break;
        case Disposition.PARTIALLY_APPROVED:
          $('#partial-approval').modal('show');
          this.initModalData();
          break;
      }
    } else {
      this.ufr = (await this.ufrService.generateTransaction(type, this.ufr).toPromise()).result;
      await this.initTransactions();
    }
  }

  async submitPartialApproved() {
    if(this.ufr.shortyType === ShortyType.NEW_INCREMENT_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_FOS_FOR_MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.MRDB_PROGRAM ||
      this.ufr.shortyType === ShortyType.NEW_PROGRAM) {
      let updateData: RowUpdateEventData [] = [];
      let partiallyApprovedFL: FundingLine [] = [];
      this.partiallyApproved.forEach((dr: DataRow) => {
        if (dr.type === 'Proposed Partial') {
          partiallyApprovedFL.push(dr.fundingLine);
        }
      });
      let pr = (await this.prService.createFromUfr({ufr: this.ufr, fundingLines: partiallyApprovedFL}).toPromise()).result;
      pr.fundingLines.forEach(async fl => {
        this.worksheets.forEach(async ws => {
          let row =ws.rows.find(r  => r.fundingLine.id === fl.id);
          if (!row) {
            let worksheetRow: WorksheetRow = {
              programRequestId: pr.id,
              programRequest: pr.shortName,
              coreCapability: pr.coreCapability,
              appropriation: fl.appropriation,
              baOrBlin: fl.baOrBlin,
              item: fl.item,
              fundingLine: fl};
            ws.rows.push(worksheetRow);

            let modifiedRow: RowUpdateEventData = {};
            modifiedRow.newFundingLine = fl;
            modifiedRow.worksheetId = ws.id;
            modifiedRow.programId = pr.shortName;
            modifiedRow.fundingLineId = fl.id;
            modifiedRow.reasonCode = 'ufr approval POM' + this.pom.fy;
            updateData.push(modifiedRow);

            let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: ws};
            await this.worksheetService.createRows(body).toPromise();
          } else {
            Object.keys(row.fundingLine.funds).forEach(year => {
              row.fundingLine.funds[year] += Number(fl.funds[year]);
            });
            let modifiedRow: RowUpdateEventData = {};
            modifiedRow.newFundingLine = fl;
            modifiedRow.previousFundingLine = row.fundingLine;
            modifiedRow.worksheetId = ws.id;
            modifiedRow.programId = row.programRequest;
            modifiedRow.fundingLineId = row.fundingLine.id;
            modifiedRow.reasonCode = 'ufr approval POM' + this.pom.fy;

            updateData.push(modifiedRow);

            let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: ws};
            await this.worksheetService.updateRows(body).toPromise();
          }
        });
      })
    } else {
      let updateData: RowUpdateEventData [] = [];
      this.partiallyApproved.forEach((dr: DataRow) => {
        let fl = dr.fundingLine;
        if (dr.type === 'Proposed Partial') {
          this.worksheets.forEach(async (ws : Worksheet) => {
            let row = ws.rows.find(r  => r.fundingLine.id === fl.id);
            if (!row) {
              let worksheetRow: WorksheetRow = {
                programRequestId: this.ufr.shortyId,
                programRequest: this.ufr.shortName,
                coreCapability: this.ufr.coreCapability,
                appropriation: fl.appropriation,
                baOrBlin: fl.baOrBlin,
                item: fl.item,
                fundingLine: fl};
              ws.rows.push(worksheetRow);

              let modifiedRow: RowUpdateEventData = {};
              modifiedRow.newFundingLine = fl;
              modifiedRow.worksheetId = ws.id;
              modifiedRow.programId = this.ufr.shortName;
              modifiedRow.fundingLineId = fl.id;
              modifiedRow.reasonCode = 'ufr approval POM' + this.pom.fy;
              updateData.push(modifiedRow);

              let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: ws};
              await this.worksheetService.createRows(body).toPromise();

            } else {
              Object.keys(row.fundingLine.funds).forEach(year => {
                row.fundingLine.funds[year] += Number(fl.funds[year]);
              });
              let modifiedRow: RowUpdateEventData = {};
              modifiedRow.newFundingLine = fl;
              modifiedRow.previousFundingLine = row.fundingLine;
              modifiedRow.worksheetId = ws.id;
              modifiedRow.programId = row.programRequest;
              modifiedRow.fundingLineId = row.fundingLine.id;
              modifiedRow.reasonCode = 'ufr approval POM' + this.pom.fy

              updateData.push(modifiedRow);

              let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: ws};
              await this.worksheetService.updateRows(body).toPromise();
            }
          });
        }
      });
    }
    this.ufr = (await this.ufrService.generateTransaction('disposition', this.ufr).toPromise()).result;
    await this.initTransactions();
    $('#partial-approval').modal('hide');
    Notify.success('UFR disposition updated successfully');
  }

  initModalData() {
    this.agGridCurrentFundingModal.api.setColumnDefs(this.currentFundingColumnDefs);
    this.agGridCurrentFundingModal.api.setRowData(this.currentFunding);

    let tempColumnDefs =Object.assign({}, this.defaultColumnDefs);
    this.partiallyApprovedColumnDefs = Object.keys(tempColumnDefs).map(i => tempColumnDefs[i]);

    this.partiallyApprovedColumnDefs.unshift({
      colId: 'flType',
      field: 'type',
      cellClass: 'funding-line-default'
    });

    let data: Array<DataRow> = [];
    this.ufr.fundingLines.forEach(fundingLine => {
      let proposedRow: DataRow = {
        type: 'Proposed Full',
        fundingLine: fundingLine,
        editable: false,
        gridType: GridType.CURRENT_PR}
      data.push(proposedRow);

      let partiallyApprovedRow: DataRow = {
        type: 'Proposed Partial',
        fundingLine: this.generateEmptyFundingLine(fundingLine),
        editable: true,
        gridType: GridType.CURRENT_PR}
      data.push(partiallyApprovedRow)
    });

    this.partiallyApproved = data;

    this.agGridProposedChangesModal.api.setColumnDefs(this.partiallyApprovedColumnDefs);
    this.agGridProposedChangesModal.api.setRowData(this.partiallyApproved);

    this.agGridRevisedProgramsModal.api.setColumnDefs(this.revisedProgramsColumnDefs);
    this.agGridRevisedProgramsModal.api.setRowData(this.revisedPrograms);

    this.agGridProposedChangesModal.gridOptions.alignedGrids = [];
    this.agGridProposedChangesModal.gridOptions.alignedGrids.push(this.agGridCurrentFundingModal.gridOptions);
    this.agGridProposedChangesModal.gridOptions.alignedGrids.push(this.agGridRevisedProgramsModal.gridOptions);

    this.agGridCurrentFundingModal.gridOptions.alignedGrids = [];
    this.agGridCurrentFundingModal.gridOptions.alignedGrids.push(this.agGridProposedChangesModal.gridOptions);
    this.agGridCurrentFundingModal.gridOptions.alignedGrids.push(this.agGridRevisedProgramsModal.gridOptions);

    this.agGridRevisedProgramsModal.gridOptions.alignedGrids = [];
    this.agGridRevisedProgramsModal.gridOptions.alignedGrids.push(this.agGridProposedChangesModal.gridOptions);
    this.agGridRevisedProgramsModal.gridOptions.alignedGrids.push(this.agGridCurrentFundingModal.gridOptions);
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
        editable: false,
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

  async initTransactions(){
    let columnDefs = [
      {
        headerName: 'Transaction Type',
        field: 'type'
        },
      {
        headerName: 'Value',
        field: 'value'
      },
      {
        headerName: 'User',
        field: 'user'
      },
      {
        headerName: 'Date',
        filter: 'agDateColumnFilter',
        field: 'date',
        valueFormatter: params => FormatterUtil.dateFormatter(params),
      }
    ];

    this.agGridTransactions.api.setColumnDefs(columnDefs);
    let events: UfrEvent[] = (await this.ufrService.getUfrEventsById(this.ufr.id).toPromise()).result;
    let transactions : TransactionRow [] = [];
    events.reverse();
    for(let e of events) {
      let date = new Date(e.timestamp);
      let user = (await this.userService.getByCn(e.userCN).toPromise()).result;
      let type;
      let value;
      switch (e.eventType) {
        case 'UFR_PRIORITY':
          type = 'Priority';
          value = e.value.priority;
          break;
        case 'UFR_STATUS':
          type = 'Status';
          value = e.value.ufrStatus;
          break;
        case 'UFR_DISPOSITION':
          type = 'Disposition';
          value = e.value.disposition;
          break;
      };
      let row: TransactionRow = {date: date, user: user.firstName + ' ' + user.lastName, value: value, type: type};
      transactions.push(row);
    };
    this.transactions = transactions
    this.agGridTransactions.api.sizeColumnsToFit();
  }

  calculateRevisedModalChanges() {
    let data: Array<DataRow> = [];
    if (this.ufr.fundingLines && this.ufr.fundingLines.length > 0) {
      this.partiallyApproved.forEach(pc => {
        if (pc.type === 'Proposed Partial') {
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
        }
      });
      this.revisedProgramsModal = data;
    } else {
      let pomRow: DataRow = {fundingLine: JSON.parse(JSON.stringify(this.generateEmptyFundingLine())),
        editable: false,
        gridType: GridType.CURRENT_PR};
      data.push(pomRow);
      this.revisedProgramsModal = data;
    }
    this.agGridRevisedProgramsModal.api.setRowData(this.revisedProgramsModal);
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
            cellEditor: 'numericCellEditor',
            cellClassRules: {
              'ag-cell-edit': params => {
                return this.isAmountEditable(params, key)
              }
            },
            editable: params => {
              return this.isAmountEditable(params, key)
            },
            onCellValueChanged: params => this.onBudgetYearValueChanged(params),
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
      type: "numericColumn",
      cellEditor: 'numericCellEditor',
      cellClassRules: {
        'ag-cell-edit': params => {
          return params.data.type !== undefined && params.data.type === 'Proposed Partial';
        }
      },
      editable: params => {
        return params.data.type !== undefined && params.data.type === 'Proposed Partial';
      },
      cellClass:['text-right'],
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params)}
    };
    this.defaultColumnDefs.push(ctcColDef);
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.colId;
    let pomNode = params.data;
    pomNode.fundingLine.funds[year] = Number(params.newValue);
    this.agGridProposedChangesModal.api.refreshCells();
    this.calculateRevisedModalChanges();
  }

  isAmountEditable(params, key): boolean{
    return key >= this.pom.fy && params.data.editable;
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
    this.pom = (await this.pomService.getById(this.ufr.phaseId).toPromise()).result;
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
      this.shorty = await this.programAndPrService.program(this.ufr.shortyId);
    } else if( this.ufr.shortyType == ShortyType.PR ||
      this.ufr.shortyType == ShortyType.NEW_INCREMENT_FOR_PR ||
      this.ufr.shortyType == ShortyType.NEW_FOS_FOR_PR ) {
      this.shorty = await this.programAndPrService.programRequest(this.pom.id, this.ufr.shortyId);
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
      emptyFundingLine.id = pomFundingLine.id;
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
  getNumericCellEditor() {
    function isCharNumeric(charStr) {
      return !!/\d/.test(charStr);
    }
    function isKeyPressedNumeric(event) {
      var charCode = getCharCodeFromEvent(event);
      var charStr = String.fromCharCode(charCode);
      return isCharNumeric(charStr);
    }
    function getCharCodeFromEvent(event) {
      event = event || window.event;
      return typeof event.which === "undefined" ? event.keyCode : event.which;
    }
    function NumericCellEditor() {}
    NumericCellEditor.prototype.init = function(params) {
      this.focusAfterAttached = params.cellStartedEdit;
      this.eInput = document.createElement("input");
      this.eInput.style.width = "100%";
      this.eInput.style.height = "100%";
      this.eInput.value = isCharNumeric(params.charPress) ? params.charPress : params.value;
      var that = this;
      this.eInput.addEventListener("keypress", function(event) {
        if (!isKeyPressedNumeric(event)) {
          that.eInput.focus();
          if (event.preventDefault) event.preventDefault();
        }
      });
    };
    NumericCellEditor.prototype.getGui = function() {
      return this.eInput;
    };
    NumericCellEditor.prototype.afterGuiAttached = function() {
      if (this.focusAfterAttached) {
        this.eInput.focus();
        this.eInput.select();
      }
    };
    NumericCellEditor.prototype.isCancelBeforeStart = function() {
      return this.cancelBeforeStart;
    };
    NumericCellEditor.prototype.isCancelAfterEnd = function() {};
    NumericCellEditor.prototype.getValue = function() {
      return this.eInput.value;
    };
    NumericCellEditor.prototype.focusIn = function() {
      var eInput = this.getGui();
      eInput.focus();
      eInput.select();
      console.log("NumericCellEditor.focusIn()");
    };
    NumericCellEditor.prototype.focusOut = function() {
      console.log("NumericCellEditor.focusOut()");
    };
    return NumericCellEditor;
  }
}

interface TransactionRow {
  date: Date,
  type: string,
  user: string,
  value: string
}
