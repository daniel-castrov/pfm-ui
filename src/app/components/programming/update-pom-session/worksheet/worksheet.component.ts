import {Component, Input, OnChanges, ViewChild, ViewEncapsulation} from '@angular/core';
import {Pom, Worksheet, WorksheetRow} from "../../../../generated";
import {FormatterUtil} from "../../../../utils/formatterUtil";
import {AgGridNg2} from "ag-grid-angular";
import {CellEditor} from "../../../../utils/CellEditor";
import {ValueChangeRenderer} from "../../../renderers/value-change-renderer/value-change-renderer.component";
import {ViewEventsRenderer} from "../../../renderers/view-events-renderer/view-events-renderer.component";
import {CheckboxCellRenderer} from "../../../renderers/anchor-checkbox-renderer/checkbox-cell-renderer.component";
import {GridToaComponent} from "./../grid-toa/grid-toa.component";
import {EventsModalComponent} from "./../events-modal/events-modal.component";

@Component({
  selector: 'worksheet',
  templateUrl: './worksheet.component.html',
  styleUrls: ['./worksheet.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class WorksheetComponent implements OnChanges {

  @ViewChild("agGrid") agGrid: AgGridNg2;

  @Input() readonly: boolean;
  @Input() pom: Pom;
  columnDefs;
  @Input() columnKeys;
  rowData;
  topPinnedData = [];
  rowSelection = 'multiple';
  @Input() selectedWorksheet: Worksheet;
  unmodifiedFundingLines: any[];
  frameworkComponents = {
    valueChangeRenderer: ValueChangeRenderer,
    viewEventsRenderer: ViewEventsRenderer,
    checkboxCellRenderer: CheckboxCellRenderer};
  @Input() eventsModalComponent: EventsModalComponent;
  @Input() gridToaComponent: GridToaComponent;
  context = { parentComponent: this, eventsModalComponent: null };
  components = { numericCellEditor: CellEditor.getNumericCellEditor() };

  ngOnChanges() {
    if (this.eventsModalComponent) {
      this.context = {...this.context, eventsModalComponent: this.eventsModalComponent};
    }
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

  generateColumns() {
    this.columnDefs = [];
    if(!this.readonly) {
      this.columnDefs.push(
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
        });
    }
    this.columnDefs.push(...[
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
      }]);

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
              cellClass: ['text-right', this.readonly ? '' : 'ag-cell-edit'],
              headerClass: 'header-without-filter',
              editable: !this.readonly,
              valueFormatter: params => {
                return FormatterUtil.currencyFormatter(params, 0, true)
              },
              onCellValueChanged: params => this.onValueChanged(params)
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
    if(!this.readonly) {
      this.columnDefs.push({
        headerName: 'Notes',
        field: 'notes',
        editable: !this.readonly,
        suppressMenu: true,
        suppressToolPanel: true,
        cellClass: this.readonly ? [] : ['ag-cell-edit'],
        onCellValueChanged: params => this.onValueChanged(params)
      });
    }

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

  onValueChanged(params){
    let textChanged: boolean = false;
    let amountChanged: boolean = false;
    if(params.colDef.headerName === 'Notes') {
      params.data.notes = params.newValue;
      textChanged = params.data.notes !== '' && params.data.notes !== undefined;
    } else {
      let year = params.colDef.colId;
      params.data.fundingLine.funds[year] = Number(params.newValue);
      amountChanged = Number(params.oldValue) !== Number(params.newValue)
    }
    if (amountChanged || textChanged) {
      params.node.setSelected(true);
      params.data.modified = true;
      this.gridToaComponent.initToaDataRows();
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
