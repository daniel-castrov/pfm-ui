import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {Budget, R3Contractor, R3ContractType, R3CostCategory, R3Entry} from '../../../../../generated';
import {GridOptions} from 'ag-grid-community';
import {AgGridNg2} from 'ag-grid-angular';
import {DeleteRenderer} from '../../../../renderers/delete-renderer/delete-renderer.component';
import {PropertyUtils} from '../../../../../utils/property-utils';
import {forkJoin} from 'rxjs';
import {CellEditor} from '../../../../../utils/CellEditor';
import {DateEditorComponent} from 'app/components/budget/edit-program-details/r3-tab/r3-entries/date-editor/date-editor.component';
import {DatePipe} from '@angular/common';
import {NgbDateParserFormatter, NgbDateStruct} from '@ng-bootstrap/ng-bootstrap';
import {CurrentPhase} from '../../../../../services/current-phase.service';


@Component({
  selector: 'r3-entries',
  templateUrl: './r3-entries.component.html',
  styleUrls: ['./r3-entries.component.scss']
})
export class R3EntriesComponent implements OnInit {

  @Input() entries: R3Entry[];
  @Output() cellChanged = new EventEmitter();
  @ViewChild("agGrid") private agGrid: AgGridNg2;
  columnDefs: any[];
  by;
  components = { numericCellEditor: CellEditor.getNumericCellEditor(), dateRenderer: (params)=>this.dateRenderer(params)};
  agOptions: GridOptions;

  constructor( private propertyUtils: PropertyUtils,
               private currentPhase: CurrentPhase,
               private dateParser: NgbDateParserFormatter) {
    this.agOptions = <GridOptions>{
      defaultColDef: {
        filter: false,
        uppressMenu: true, 
        editable: true, 
        cellClass: 'ag-cell-edit'
      },
      domLayout: 'normal',
      animateRows: true,
      suppressMovableColumns: true,
      suppressRowTransform: true,
      suppressPaginationPanel: true,
      stopEditingWhenGridLosesFocus: true,
      singleClickEdit: true,
      frameworkComponents: {
        deleteRenderer: DeleteRenderer, 
        dateEditor: DateEditorComponent
      },
      context: {
        parentComponent: this,
        deleteHidden: false
      }
    }                
  }

  async ngOnInit() {
    const [r3CostCategories, r3ContractTypes, r3Contractors, budget] = await forkJoin(
          this.propertyUtils.r3CostCategory(),
          this.propertyUtils.r3ContractType(),
          this.propertyUtils.r3Contractor(),
          this.currentPhase.budget() ).toPromise() as [R3CostCategory[], R3ContractType[], R3Contractor[], Budget];

    this.initColumnDefs( r3CostCategories.map(c=>c.code),
                         r3ContractTypes.map(c=>c.code),
                         r3Contractors.map(c=>c.activity+', '+c.city+', '+c.state),
                         budget.fy );
    this.by = budget.fy;
  }

  initColumnDefs(r3CostCategories: string[], r3ContractTypes: string[], r3Contractors: string[], fy: number) {
    this.columnDefs = [
      {
        headerName: '',
        headerClass: ['ag-cell-white'],
        children: [{
          headerName: '',
          colId: 'delete',
          cellClass: 'ag-cell-white text-center',
          cellRenderer: 'deleteRenderer',
          width: 50,
        },
        {
          headerName: 'Group',
          field: 'group',
          width: 160,
          sortable: true,
          sort: "asc",
          sortingOrder: ["asc","desc"],
          unSortIcon: true,
          cellEditorSelector: () => {
            return {
              component: 'agSelectCellEditor',
              params: { values: ['Product Development','Support', 'Test & Evaluation','Management'] }
            };
          },
        },
        {
          headerName: 'Cost Category Item',
          field: 'costCategoryItem',
          cellEditorSelector: () => {
            return {
              component: 'agSelectCellEditor',
              params: { values: r3CostCategories }
            };
          },
        },
        {
          headerName: 'Item Description',
          field: 'itemDescription',
        },
        {
          headerName: 'Contract Method & Type',
          field: 'contractMethodAndType',
          cellEditorSelector: () => {
            return {
              component: 'agSelectCellEditor',
              params: { values: r3ContractTypes }
            };
          },
        },
        {
          headerName: 'Performing Activity & Location',
          field: 'performingActivityAndLocation',
          cellEditorSelector: () => {
            return {
              component: 'agSelectCellEditor',
              params: { values: r3Contractors }
            };
          },
          width: 400,
        },
        {
          headerName: 'Prior Years',
          field: 'priorYears',
          editable: false,
          cellClass: 'ag-cell-white text-center',
          width: 102,
        }]
      },
      {
        headerName: 'FY' + (fy - 2002),
        colId: fy - 2,
        children: [{
          headerName: 'Cost($M)',
          colId: 'pyCost',
          field: 'pyCost',
          width: 102,
          cellEditor: 'numericCellEditor',
          onCellValueChanged: params => this.onCostChanged(params),
        },
        {
          headerName: 'Award Date',
          field: 'pyAwardDate',
          width: 102,
          cellClass: 'ag-cell-edit',
          cellRenderer: 'dateRenderer',
          cellEditor: 'dateEditor'
        }]
      },
      {
        headerName: 'FY' + (fy - 2001),
        colId: fy - 1,
        children: [{
          headerName: 'Cost($M)',
          colId: 'cyCost',
          field: 'cyCost',
          width: 102,
          cellEditor: 'numericCellEditor',
          onCellValueChanged: params => this.onCostChanged(params),
        },
        {
          headerName: 'Award Date',
          field: 'cyAwardDate',
          cellClass: 'ag-cell-edit',
          width: 102,
          cellRenderer: 'dateRenderer',
          cellEditor: 'dateEditor',
        }]
      },
      {
        headerName: 'FY' + (fy - 2000),
        colId: fy,
        children: [{
          headerName: 'Cost($M)',
          colId: 'byCost',
          field: 'byCost',
          width: 102,
          cellEditor: 'numericCellEditor',
          onCellValueChanged: params => this.onCostChanged(params),
        },
        {
          headerName: 'Award Date',
          field: 'byAwardDate',
          cellClass: 'ag-cell-edit',
          width: 102,
          cellRenderer: 'dateRenderer',
          cellEditor: 'dateEditor',
        }]
      }
    ];
  }

  onCostChanged(params){

    // Force the updateed cell's value to be a number.
    params.data[ params.colDef.colId ] = Number( params.newValue );
    this.cellChanged.emit("CellChanged")

  }

  // callback for DeleteRender
  delete(rowIndex, data) {
    this.entries.splice(rowIndex,1);
    this.agGrid.api.setRowData(this.entries);
  }

  addEntry() {
    this.entries.push({pyCost: null, pyAwardDate: null, cyCost: null, cyAwardDate: null, byCost: null, byAwardDate: null});
    this.agGrid.api.setRowData(this.entries);
  }

  dateRenderer(params): string {
    const datePipe = new DatePipe('en-US');
    const date: NgbDateStruct = params.value;
    if (!date) return '';
    return datePipe.transform(new Date(date.year, date.month - 1, date.day), 'MMM yyyy');
  }

  invalid() {
    const submissionDate = new Date(this.by - 1, 2, 1);
    let isInvalid = false;
    this.entries.forEach(entry => {
      if (entry.byAwardDate && new Date(entry.byAwardDate.year, entry.byAwardDate.month, entry.byAwardDate.day) < submissionDate) {
        if (isInvalid = entry.performingActivityAndLocation === 'TBD' || entry.performingActivityAndLocation === null) {
          return;
        }
      }
      if (isInvalid = !this.isFieldValid(entry.byCost, entry.byAwardDate)) {
        return;
      }
      if (isInvalid = !this.isFieldValid(entry.cyCost, entry.cyAwardDate)) {
        return;
      }
      if (isInvalid = !this.isFieldValid(entry.pyCost, entry.pyAwardDate)) {
        return;
      }
    });
    return isInvalid;
  }

  isFieldValid (field1, field2): boolean {
    if (field1) {
      return field2 !== null;
    }
    if (field2) {
      return field1 !== null;
    }
    return true;
  }
}
