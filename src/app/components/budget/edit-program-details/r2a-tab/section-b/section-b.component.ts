import {Component, Input, OnChanges, ViewChild, ViewEncapsulation} from '@angular/core';
import {
  Bullet, LockPosition, LockPositionService, PresidentialBudget, PropertyService,
  R2AProgramData
} from '../../../../../generated';
import {AgGridNg2} from 'ag-grid-angular';
import {DeleteRenderer} from '../../../../renderers/delete-renderer/delete-renderer.component';
import {FormatterUtil} from '../../../../../utils/formatterUtil';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {CurrentPhase} from '../../../../../services/current-phase.service';
import {SummaryDetail} from '../../../../../generated/model/summaryDetail';
import {RdteProgramContextService} from '../../rdte-program-context.service';
import {CellEditor} from '../../../../../utils/CellEditor';
import { GridOptions } from 'ag-grid-community';

@Component({
  selector: 'section-b',
  templateUrl: './section-b.component.html',
  styleUrls: ['./section-b.component.scss']
})
export class SectionBComponent implements OnChanges {

  @ViewChild('agGrid') agGrid: AgGridNg2;
  @ViewChild('increaseDecreaseStatement') increaseDecreaseStatement: any;

  @Input() r2AData: R2AProgramData;

  columnDefs;
  rowData = [];
  titles;
  selectedRow;
  gridSequence;
  by;
  py;
  cy;
  explanations;
  components = { numericCellEditor: CellEditor.getNumericCellEditor() };
  form: FormGroup;
  summaryDetail: SummaryDetail;
  delta: any = {};
  program;
  item;
  agOptions: GridOptions;

  constructor(private propertyService: PropertyService,
              private currentPhase: CurrentPhase,
              private lockPositionService: LockPositionService,
              private rdteProgramContextService: RdteProgramContextService ) {
    this.agOptions = <GridOptions>{
      defaultColDef: {
        filter: false
      },
      suppressMovableColumns: true,
      suppressRowTransform: true,
      suppressPaginationPanel: true,
      context: {
        parentComponent: this,
        deleteHidden: false
      },
      frameworkComponents: { deleteRenderer: DeleteRenderer }
    }
  }

  async ngOnChanges() {
    this.program = this.rdteProgramContextService.program().shortName;
    this.item = this.rdteProgramContextService.item()
    this.by = (await this.currentPhase.budget().toPromise()).fy - 2000;
    this.py = this.by - 2;
    this.cy = this.by - 1;
    this.propertyService.getR2aBulletTitles(
      this.rdteProgramContextService.ba(),
      this.rdteProgramContextService.item()).subscribe(response => {
      if (response.result) {
        this.titles = response.result.value.titles;
        // TODO: create the 'Other' option for BA greater than BA4 to allow the user to input text
      } else {
        this.titles = [];
      }
    });
    this.initColumnDefs();
  }

  initColumnDefs() {
    const columnDefs = [
      {
        headerName: '',
        colId: 'delete',
        cellRenderer: 'deleteRenderer',
        cellStyle: {'text-align': 'center'},
        cellClass: 'ag-cell-white',
        width: 40,
      },
      {
        headerName: 'ID',
        suppressMenu: true,
        field: 'id',
        maxWidth: 200,
        cellClass: 'ag-cell-white',
      },
      {
        headerName: 'Title',
        suppressMenu: true,
        field: 'title',
        editable: true,
        cellClass: 'ag-cell-edit',
        cellEditorSelector: params => {
          if (this.titles.length > 0) {
            return {
              component: 'agSelectCellEditor',
              params: {values: this.titles}
            };
          }
        }
      },
      {
        headerName: 'FY' + this.py,
        suppressMenu: true,
        field: 'fundsPY',
        maxWidth: 100,
        editable: true,
        cellClass: 'ag-cell-edit',
        cellEditor: 'numericCellEditor',
        valueFormatter: params => FormatterUtil.currencyFormatter(params),
        onCellValueChanged: params => this.onValueChange(params)
      },
      {
        headerName: 'FY' + this.cy,
        suppressMenu: true,
        field: 'fundsCY',
        maxWidth: 100,
        editable: true,
        cellClass: 'ag-cell-edit',
        cellEditor: 'numericCellEditor',
        valueFormatter: params => FormatterUtil.currencyFormatter(params),
        onCellValueChanged: params => this.onValueChange(params)
      },
      {
        headerName: 'FY' + this.by,
        suppressMenu: true,
        field: 'fundsBY',
        maxWidth: 100,
        editable: true,
        cellClass: 'ag-cell-edit',
        cellEditor: 'numericCellEditor',
        valueFormatter: params => FormatterUtil.currencyFormatter(params),
        onCellValueChanged: params => this.onValueChange(params)
      }
    ];
    this.columnDefs = columnDefs;
    this.initRowData();
  }

  onSelectionChanged() {
    this.agGrid.api.getSelectedRows().forEach(row => {
      this.selectedRow = row;
    });
    this.initializeForm(this.selectedRow);
  }

  onValueChange(params) {
    this.explanations = [];
    if (params.data.fundsBY !== params.data.fundsCY) {
      const delta = params.data.fundsBY - params.data.fundsCY;
      const percentage = delta / params.data.fundsCY;
      if (Math.abs(percentage) < 0.10) {
        this.selectedRow.increaseDecreaseStatement = 'Minor change due to routine program adjustments';
      } else {
        let increaseOrDecrease;
        if (delta > 0) {
          increaseOrDecrease = 'Increase';
        } else {
          increaseOrDecrease = 'Decrease';
        }
        this.explanations = [
          increaseOrDecrease + ' due to change in a program/project schedule',
          increaseOrDecrease + ' due to delay of a Milestone decision',
          increaseOrDecrease + ' due to change in program/project technical parameters',
          increaseOrDecrease + ' due to fact of lie change in the program/project',
          increaseOrDecrease + ' due to accelerated development effort',
          increaseOrDecrease + ' due to change in validated JCIDS requirement document',
          'Program/project is new start effort in FY' + this.by + ' (BY)',
          'Program/project terminated in FY' + this.cy + ' (CY)',
          'Program/project funding transferred to another funding line',
          'Program/project transitioned to Advanced Development',
          'Program/project transitioned to Engineering and Manufacturing Development Phase',
          'Program/project transitioned to Production and Deployment Phase',
          'Program/project is entering completion and all activities will be closed',
          'Program/project transitioned to Advanced Technology Development'
        ];
      }
    }
    this.form = new FormGroup({
      description: new FormControl('', Validators.required),
      accomplishmentsPY: new FormControl('', params.data.fundsPY ? Validators.required : null),
      plansCY: new FormControl('', params.data.fundsCY ? Validators.required : null),
      plansBY: new FormControl('', params.data.fundsBY ? Validators.required : null),
      increaseDecreaseStatement: new FormControl('', params.data.fundsBY ? Validators.required : null)
    });
    this.calculateSummary();
  }

  onExplanationSelected(value) {
    this.selectedRow.increaseDecreaseStatement = value + '\n';
    this.increaseDecreaseStatement.nativeElement.focus();
  }

  initializeForm(data) {
    this.form = new FormGroup({
      description: new FormControl('', Validators.required),
      accomplishmentsPY: new FormControl('', data.fundsPY ? Validators.required : null),
      plansCY: new FormControl('', data.fundsCY ? Validators.required : null),
      plansBY: new FormControl('', data.fundsBY ? Validators.required : null),
      increaseDecreaseStatement: new FormControl('', data.fundsBY ? Validators.required : null)
    });
  }

  delete(rowIndex, data) {
    this.agGrid.api.updateRowData({remove: [data]});
    this.r2AData.bullets.splice(rowIndex, 1);
  }

  initRowData() {
    if (this.agGrid) {
      this.agGrid.api.setRowData(this.r2AData.bullets);
      // TODO: initialize here the existing data from the R-2A Object that Rossen will create
    }

    this.lockPositionService.getLatestForScenario(this.rdteProgramContextService.scenarioId()).subscribe(response => {
      const lockPosition: LockPosition = response.result;
      this.summaryDetail = lockPosition.mapPeToDetails[this.rdteProgramContextService.pe()].summary[PresidentialBudget.CURRENT];
      this.calculateSummary();
    });
  }

  calculateSummary() {
    const bulletTotals = {fundsPY: 0, fundsCY: 0, fundsBY: 0};
    this.agGrid.api.forEachNode(node => {
      bulletTotals.fundsPY += Number(node.data.fundsPY);
      bulletTotals.fundsCY += Number(node.data.fundsCY);
      bulletTotals.fundsBY += Number(node.data.fundsBY);
    });

    this.delta = {
      fundsPY: this.summaryDetail.py - bulletTotals.fundsPY,
      fundsCY: this.summaryDetail.cy - bulletTotals.fundsCY,
      fundsBY: this.summaryDetail.by - bulletTotals.fundsBY
    };
  }

  addBullet() {
    if (this.gridSequence) {
      this.gridSequence++;
    } else {
      this.gridSequence = this.agGrid.api.getDisplayedRowCount();
    }
    const data: Bullet = {
      id: this.rdteProgramContextService.program().shortName + "-" + this.rdteProgramContextService.item() + '-' + (this.gridSequence + 1),
      title: '',
      fundsPY: 0,
      fundsCY: 0,
      fundsBY: 0,
      description: '',
      accomplishmentsPY: '',
      plansCY: '',
      plansBY: '',
      increaseDecreaseStatement: ''
    };
    if (!this.r2AData.bullets) {
      this.r2AData.bullets = [];
    }
    this.r2AData.bullets.push(data);
    this.agGrid.api.updateRowData({
      add: [data]
    });
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

  invalid(): boolean {
    const invalid = [];
    if ( this.selectedRow ){
      const controls = this.form.controls;
      for (const name in this.form.controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }
    }
    return invalid.length > 0
      || this.r2AData.bullets.some(b => b.title === undefined || b.title === '')
      || (this.delta.fundsBY + this.delta.fundsCY + this.delta.fundsPY) !== 0;
  }
}
