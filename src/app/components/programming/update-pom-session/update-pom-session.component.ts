import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import {NgbTypeahead} from '@ng-bootstrap/ng-bootstrap';
import {Observable, Subject} from 'rxjs';
import {merge} from 'rxjs/observable/merge';
import {debounceTime, distinctUntilChanged, filter, map} from 'rxjs/operators';

// Other Components
import { HeaderComponent } from '../../../components/header/header.component';
import {
  Pom, POMService, RowUpdateEvent, TOA, User, UserService, Worksheet, WorksheetEvent, WorksheetRow,
  WorksheetService
} from "../../../generated";
import {UserUtils} from "../../../services/user.utils";
import {FormatterUtil} from "../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {CellEditor} from "../../../utils/CellEditor";
import {Notify} from "../../../utils/Notify";
import {RowNode} from "ag-grid";
import {ActivatedRoute} from "@angular/router";
import {RowUpdateEventData} from "../../../generated/model/rowUpdateEventData";
import {ValueChangeRenderer} from "../../renderers/value-change-renderer/value-change-renderer.component";
import {ViewEventsRenderer} from "../../renderers/view-events-renderer/view-events-renderer.component";
import {TagsService} from "../../../services/tags.service";
import {CheckboxCellRenderer} from "../../renderers/anchor-checkbox-renderer/checkbox-cell-renderer.component";

declare const $: any;

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
  @ViewChild("agGridEvents") private agGridEvents: AgGridNg2;
  @ViewChild("instance") instance: NgbTypeahead;

  pom: Pom;
  user: User;
  columnDefs;
  toaColumnDefs;
  eventsColumnDefs;
  detailCellRendererParams;
  detailRowHeight = 100;
  columnKeys;
  rowData;
  topPinnedData = [];
  toaRowData;
  eventsRowData;
  filterText;
  rowSelection = 'multiple';
  bulkType: string;
  bulkAmount: number;
  worksheets: Array<Worksheet>;
  selectedWorksheet: Worksheet = undefined;
  reasonCode;
  focus$ = new Subject<string>();
  click$ = new Subject<string>();
  unmodifiedFundingLines: any[];
  frameworkComponents = {
    valueChangeRenderer: ValueChangeRenderer,
    viewEventsRenderer: ViewEventsRenderer,
    checkboxCellRenderer: CheckboxCellRenderer};
  context = { parentComponent: this };
  components = { numericCellEditor: CellEditor.getNumericCellEditor() };
  tags: any[];
  search = (text$: Observable<string>) => {
    const debouncedText$ = text$.pipe(debounceTime(200), distinctUntilChanged());
    const clicksWithClosedPopup$ = this.click$.pipe(filter(() => !this.instance.isPopupOpen()));
    const inputFocus$ = this.focus$;
    return merge(debouncedText$, inputFocus$, clicksWithClosedPopup$).pipe(
      map(term => (term === '' ? this.tags
        : this.tags.filter(v => v.toLowerCase().indexOf(term.toLowerCase()) > -1)).slice(0, 10))
    );
  };

  constructor(private userUtils: UserUtils,
              private pomService: POMService,
              private worksheetService: WorksheetService,
              private route: ActivatedRoute,
              private userService: UserService,
              private tagService: TagsService) { }

  ngOnInit() {
    let worksheetId = this.route.snapshot.params['id'];
    this.userUtils.user().subscribe( user => {
      this.user = user;
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
          this.worksheets = worksheets.result.filter(worksheet => !worksheet.locked);
          this.selectedWorksheet = this.worksheets.find(worksheet => worksheet.id === worksheetId);
          if (this.selectedWorksheet !== undefined) {
            this.onWorksheetSelected();
          }
        });
      });
    });
    this.initReasonCode();
  }

  initReasonCode(){
    this.tagService.tagAbbreviationsForReasonCode().then(tags => {
      this.tags = tags;
    });
  }

  final() {
    this.worksheets.forEach(worksheet => {
      this.worksheetService.update({...worksheet, locked: true}).toPromise();
    });
    this.worksheetService.update({...this.selectedWorksheet, isFinal: true, locked: true}).subscribe(response => {
      this.worksheetService.updateProgramRequests(this.selectedWorksheet.id).subscribe(response => {
        this.pomService.updatePomStatus(this.pom.id, Pom.StatusEnum.RECONCILIATION).subscribe(response => {
          this.selectedWorksheet.isFinal = true;
          Notify.success('Worksheet marked as final successfully')
        })
      });
    });
  }

  update(){
    let updateData: RowUpdateEventData [] = [];
    let modifiedRows: RowNode [] = this.agGrid.api.getSelectedNodes();
    if (modifiedRows.length === 0) {
      Notify.error('No changes detected.')
    } else {
      if(!this.reasonCode){
        Notify.error('You must select or create a reason code.')
      } else {
        let someNotesEmpty = modifiedRows.some(node => node.data.notes === '');
        if(someNotesEmpty) {
          Notify.error('You must fill the notes column for all highlighted rows.')
        } else {
          this.agGrid.api.getSelectedNodes().forEach(node => {
            let modifiedRow : RowUpdateEventData = {};
            modifiedRow.notes = node.data.notes;
            modifiedRow.newFundingLine = node.data.fundingLine;
            modifiedRow.previousFundingLine = this.unmodifiedFundingLines.find(ufl =>
              ufl.fundingLine.id === node.data.fundingLine.id).fundingLine;
            modifiedRow.reasonCode = this.reasonCode;
            modifiedRow.worksheetId = this.selectedWorksheet.id;
            modifiedRow.programId = node.data.programId
            modifiedRow.fundingLineId = node.data.fundingLine.id;
            updateData.push(modifiedRow);

            node.data.modified = false;
            node.setSelected(false);
            node.data.notes = '';
          });
          this.reasonCode = null;
          this.agGrid.api.refreshCells();
          let body: WorksheetEvent = {rowUpdateEvents: updateData, worksheet: this.selectedWorksheet};
          this.worksheetService.updateRows(body).subscribe(response => {
            if (!response.error) {
              this.generateUnmodifiedFundingLines();
              this.initReasonCode();
              Notify.success('Worksheet updated successfully');
            } else {
              Notify.error('Something went wrong while trying to update the worksheet');
              console.log(response.error);
            }
          });
        }
      }
    }
  }

  async viewEvents(params){
    let data: Array<any> = [];
    let worksheetRowEvents : RowUpdateEvent[] = (await this.worksheetService.getWorksheetRowEvents(
      this.selectedWorksheet.id, params.data.fundingLine.id).toPromise()).result;

    for(let wre of worksheetRowEvents) {
      let user = (await this.userService.getByCn(wre.userCN).toPromise()).result;
      let date = new Date(wre.timestamp);
      let dataRow = {
        date: date,
        user: user.firstName + ' ' + user.lastName,
        reasonCode: wre.value.reasonCode,
        notes: wre.value.notes,
        programId: wre.value.programId,
        previousFundingLine: wre.value.previousFundingLine,
        newFundingLine: wre.value.newFundingLine
      };
      data.push(dataRow);
    }
    if(data.length > 0){
      this.eventsRowData = data;
      this.agGridEvents.api.sizeColumnsToFit();
      $('#events-modal').modal('show');
    } else {
      Notify.info('There are no transactions registered for this funding line')
    }
  }

  applyBulkChange(){
    this.agGrid.api.forEachNodeAfterFilterAndSort((rowNode: RowNode) => {
      if (rowNode.rowIndex <= this.agGrid.api.getLastDisplayedRow()) {
        this.columnKeys.forEach(year => {
          let additionalAmount = 0;
          if (this.bulkType === 'percentage') {
            additionalAmount = rowNode.data.fundingLine.funds[year] * (this.bulkAmount / 100);
          } else {
            additionalAmount = this.bulkAmount;
          }
          rowNode.data.fundingLine.funds[year] = (isNaN(rowNode.data.fundingLine.funds[year])? 0 : rowNode.data.fundingLine.funds[year]) + additionalAmount;
          rowNode.data.modified = true;
          rowNode.setSelected(true);
          if (rowNode.data.fundingLine.funds[year] < 0) {
            rowNode.data.fundingLine.funds[year] = 0;
          }
        });
      }
    });

    this.topPinnedData.forEach(row => {
      this.columnKeys.forEach(year => {
        let additionalAmount = 0;
        if (this.bulkType === 'percentage') {
          additionalAmount = row.fundingLine.funds[year] * (this.bulkAmount / 100);
        } else {
          additionalAmount = this.bulkAmount;
        }
        row.fundingLine.funds[year] = (isNaN(row.fundingLine.funds[year])? 0 : row.fundingLine.funds[year]) + additionalAmount;
        row.modified = true;
        if (row.fundingLine.funds[year] < 0) {
          row.fundingLine.funds[year] = 0;
        }
      });
    });

    this.bulkAmount = null;
    this.agGrid.api.redrawRows();
    this.initToaDataRows();
  }

  onWorksheetSelected(){
    setTimeout(() => {
      this.initRowClass();

      this.initDataRows();
      this.generateColumns();

      this.initToaDataRows();
      this.generateToaColumns();

      this.generateEventsColumns();
    });
  }

  onFilterTextBoxChanged() {
    this.agGrid.gridOptions.api.setQuickFilter( this.filterText );
  }

  initRowClass(){
    this.agGrid.gridOptions.rowClassRules = {
      'pinned-row-modified': function(params) {
        return params.node.rowPinned === 'top' && params.data.modified === true}
    }
    this.agGrid.gridOptions.getRowNodeId = data => {
      return data.fundingLine.id;
    }
  }

  initDataRows(){
    let data: Array<any> = [];
    this.selectedWorksheet.rows.forEach((value: WorksheetRow) => {
      let row = {
        id: value.fundingLine.id,
        coreCapability: value.coreCapability,
        programId: value.programRequestFullname,
        fundingLine: value.fundingLine,
        modified: false,
        notes: '',
        anchored: false
      };
      data.push(row);
    });
    this.rowData = data;
    this.agGrid.api.sizeColumnsToFit();
    this.generateUnmodifiedFundingLines();
  }

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

  generateUnmodifiedFundingLines() {
    let data: Array<any> = [];
    this.selectedWorksheet.rows.forEach((value: WorksheetRow) => {
      let worksheet = JSON.parse(JSON.stringify(value));
      let row = {
        programId: worksheet.programRequestFullname,
        fundingLine: worksheet.fundingLine
      };
      data.push(row);
    });
    this.unmodifiedFundingLines = data;
  }

  generateEventsColumns(){
    this.eventsColumnDefs = [
      {
        headerName: 'Reason Code',
        field: 'reasonCode',
        cellRenderer: 'agGroupCellRenderer',
        maxWidth: 200,
        minWidth: 200
      },
      {
        headerName: 'Notes',
        field: 'notes',
        tooltipField: 'notes'
      },
      {
        headerName: 'User',
        field: 'user',
        maxWidth: 125,
        minWidth: 125
      },
      {
        headerName: 'Date',
        filter: 'agDateColumnFilter',
        field: 'date',
        valueFormatter: params => FormatterUtil.dateFormatter(params),
        maxWidth: 200,
        minWidth: 200
      }
    ];

    let detailColumnDefs: any[] = [
      {
        headerName: 'Program ID',
        field: 'programId'
      }];
    this.columnKeys.forEach(key => {
      if (key >= this.pom.fy) {
        let columnKey = key.toString().replace('20', 'FY')
        let colDef = {
          headerName: columnKey,
          colId: key,
          suppressToolPanel: true,
          cellRenderer: 'valueChangeRenderer',
          cellClass: ['funding-line-default']
        };
        detailColumnDefs.push(colDef);
      }
    });

    this.detailCellRendererParams = {
      detailGridOptions: {
        columnDefs: detailColumnDefs,
        frameworkComponents: this.frameworkComponents,
        context: this.context,
        gridAutoHeight: true,
        toolPanelSuppressSideButtons: true,
        onGridReady(params) {
          params.api.sizeColumnsToFit();
        }
      },
      getDetailRowData: function(params) {
        let data = [{programId: params.data.programId,
          newFundingLine: params.data.newFundingLine,
          previousFundingLine: params.data.previousFundingLine}];
        params.successCallback(data);
      }
    };
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

  generateColumns() {
    this.columnDefs = [
      {
        headerName: 'Anchor',
        colId: 'anchor',
        field: 'anchored',
        suppressToolPanel: true,
        cellRenderer: 'checkboxCellRenderer',
        cellClass: ['funding-line-default'],
        headerClass: 'header-without-filter',
        maxWidth: 50,
        minWidth: 50,
        suppressMenu: true
      },
      {
        headerName: 'Transactions',
        colId: 'events',
        suppressToolPanel: true,
        cellRenderer: 'viewEventsRenderer',
        cellClass: ['funding-line-default'],
        headerClass: 'header-without-filter',
        maxWidth: 80,
        minWidth: 80,
        suppressMenu: true
      },
      {
        headerName: 'Core Capability',
        headerTooltip: 'Core Capability',
        field: 'coreCapability',
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
      },
      {
        headerName: 'Program ID',
        headerTooltip: 'Program ID',
        colId: 'programId',
        field: 'programId',
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
      },
      {
        headerName: 'Appn',
        headerTooltip: 'Appropriation',
        field: 'fundingLine.appropriation',
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
      },
      {
        headerName: 'BA/BLIN',
        headerTooltip: 'BA/BLIN',
        field: 'fundingLine.baOrBlin',
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
      },
      {
        headerName: 'Item',
        headerTooltip: 'Item',
        field: 'fundingLine.item',
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
      },
      {
        headerName: 'OpAgency',
        headerTooltip: 'OpAgency',
        field: 'fundingLine.opAgency',
        hide: true,
        suppressMenu: true,
        cellClass: ['funding-line-default', 'text-left']
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
              headerClass: 'header-without-filter',
              editable: true,
              valueFormatter: params => {
                return FormatterUtil.currencyFormatter(params, 0, true)
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
      cellClass: ['ag-cell-white','text-right'],
      headerClass: 'header-without-filter',
      valueGetter: params => {return this.getTotal(params.data, this.columnKeys)},
      valueFormatter: params => {return FormatterUtil.currencyFormatter(params, 0, true)}
    };
    this.columnDefs.push(totalColDef);
    this.columnDefs.push({
      headerName: 'Notes',
      field: 'notes',
      editable: params => {
        if(params.data.modified){
          return true;
        }
      },
      suppressMenu: true,
      suppressToolPanel: true,
      cellClass: ['ag-cell-white','text-right']
    });

    this.agGrid.api.setColumnDefs(this.columnDefs);
    this.agGrid.api.sizeColumnsToFit();
  }

  onAnchor(params){
    this.agGrid.api.onFilterChanged();
    if (params.data.anchored) {
      this.topPinnedData.push(params.data);
    } else {
      this.topPinnedData.splice(this.topPinnedData.indexOf(this.agGrid.api.getRowNode(params.node.data.id).data), 1);
      if(params.data.modified){
        this.agGrid.api.getRowNode(params.node.data.id).setSelected(true)
      }
    }
    this.agGrid.api.setPinnedTopRowData(this.topPinnedData);
  }

  isExternalFilterPresent(){
    return true;
  }

  doesExternalFilterPass(node) {
    return !node.data.anchored;
  }

  onBudgetYearValueChanged(params){
    let year = params.colDef.colId;
    params.data.fundingLine.funds[year] = Number(params.newValue);
    if (Number(params.oldValue) !== Number(params.newValue)) {
      params.node.setSelected(true);
      params.data.modified = true;
      this.initToaDataRows();
    }else {
      params.node.setSelected(false);
    }
    this.agGrid.api.redrawRows();
  }

  onRowSelected(params) {
    if(params.data.modified){
      params.node.setSelected(true);
    } else {
      params.node.setSelected(false)
    }
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
