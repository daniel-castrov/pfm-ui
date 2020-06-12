import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ColGroupDef, GridApi } from '@ag-grid-community/all-modules';
import { DataGridMessage } from '../../../../pfm-coreui/models/DataGridMessage';
import { NumericCellEditor } from 'src/app/ag-grid/cell-editors/NumericCellEditor';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { FundingLineService } from 'src/app/programming-feature/services/funding-line.service';
import { FundingData } from 'src/app/programming-feature/models/funding-data.model';
import { map, switchMap, catchError } from 'rxjs/operators';
import { FundingLine } from 'src/app/programming-feature/models/funding-line.model';
import { Observable, of, throwError } from 'rxjs';
import { PropertyService } from '../../../services/property.service';
import { PropertyType } from '../../../models/enumerations/property-type.model';
import { Property } from '../../../models/property.model';
import { Appropriation } from '../../../models/appropriation.model';
import { BaBlin } from '../../../models/ba-blin.model';
import { SAG } from '../../../models/sag.model';
import { ExpenditureType } from '../../../models/expenditure-type.model';
import { WorkUnitCode } from '../../../models/work-unit-code.model';
import { RestResponse } from 'src/app/util/rest-response';
import { DropdownCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/dropdown-cell-renderer/dropdown-cell-renderer.component';
import { GoogleChartComponent, GoogleChartInterface } from 'ng2-google-charts';
import { ProgramStatus } from 'src/app/programming-feature/models/enumerations/program-status.model';
import { FundingLineActionCellRendererComponent } from 'src/app/pfm-coreui/datagrid/renderers/funding-line-action-cell-renderer/funding-line-action-cell-renderer.component';
import { AllowedCharacters } from 'src/app/ag-grid/cell-editors/AllowedCharacters';
import { UFR } from 'src/app/programming-feature/models/ufr.model';
import { ProgrammingService } from 'src/app/programming-feature/services/programming-service';
import { PomService } from 'src/app/programming-feature/services/pom-service';
import { WorkspaceService } from 'src/app/programming-feature/services/workspace.service';
import { Pom } from 'src/app/programming-feature/models/Pom';
import { PomStatus } from 'src/app/programming-feature/models/enumerations/pom-status.model';
import { Workspace } from 'src/app/programming-feature/models/workspace';
import { Program } from 'src/app/programming-feature/models/Program';
import { ShortyType } from 'src/app/programming-feature/models/enumerations/shorty-type.model';

@Component({
  selector: 'pfm-ufr-funds',
  templateUrl: './ufr-funds.component.html',
  styleUrls: ['./ufr-funds.component.scss']
})
export class UfrFundsComponent implements OnInit {
  @ViewChild('googleChart')
  chart: GoogleChartComponent;

  @Input() pomYear: number;
  @Input() ufr: UFR;

  actionState = {
    VIEW: {
      canSave: false,
      canEdit: true,
      canDelete: true,
      isSingleDelete: true
    },
    VIEW_NO_DELETE: {
      canSave: false,
      canEdit: true,
      canDelete: false,
      isSingleDelete: true
    },
    EDIT: {
      canEdit: false,
      canSave: true,
      canDelete: true,
      isSingleDelete: true
    }
  };

  chartData: GoogleChartInterface = {
    chartType: 'LineChart',
    options: {
      title: 'Current vs. UFR Revised Funding',
      width: 1000,
      height: 350,
      chartArea: {
        width: '50%',
        height: '70%',
        left: '15%'
      },
      series: {
        0: {
          type: 'line'
        },
        1: {
          type: 'line'
        }
      },
      vAxis: {
        format: '$#,###',
        gridlines: {
          count: 10
        }
      },
      animation: {
        duration: 500,
        easing: 'out',
        startup: true
      }
    }
  };

  busy: boolean;

  currentFundingLineGridApi: GridApi;
  currentFundingLineRows: FundingData[] = [];
  currentFundingLineColumnsDefinition: ColGroupDef[];

  proposedFundingLineGridApi: GridApi;
  proposedFundingLineRows: FundingData[] = [];
  proposedFundingLineColumnsDefinition: ColGroupDef[];

  totalRevisedFundingLineGridApi: GridApi;
  totalRevisedFundingLineRows: FundingData[] = [];
  totalRevisedFundingLineColumnsDefinition: ColGroupDef[];

  approvedFundingLineGridApi: GridApi;
  approvedFundingLineRows: FundingData[] = [];
  approvedFundingLineColumnsDefinition: ColGroupDef[];

  proposedFundingLineRowDataState: RowDataStateInterface = {};
  deleteDialog: DeleteDialogInterface = { title: 'Delete' };

  appnOptions = [];
  allBaBlins = [];
  baOptions = [];
  sagOptions = [];
  wucdOptions = [];
  expTypeOptions = [];

  showCurrentFundingGrid: boolean;

  constructor(
    private pomService: PomService,
    private workspaceService: WorkspaceService,
    private programmingService: ProgrammingService,
    private dialogService: DialogService,
    private propertyService: PropertyService,
    private fundingLineService: FundingLineService
  ) {}

  ngOnInit() {
    this.showCurrentFundingGrid = this.ufr.shortyType === ShortyType.PR;
    this.setupCurrentFundingLineGrid();
    this.loadDropDownValues();
  }

  onCurrentFundingLineGridIsReady(api: GridApi) {
    this.currentFundingLineGridApi = api;
    this.currentFundingLineRows = [];
    this.updateTotalFields(this.currentFundingLineGridApi, this.currentFundingLineRows, 'Current');
    this.loadDataFromProgram();
  }

  onProposedFundingLineGridIsReady(api: GridApi) {
    this.proposedFundingLineGridApi = api;
    if (this.showCurrentFundingGrid) {
      this.proposedFundingLineGridApi.setHeaderHeight(0);
    }
    this.proposedFundingLineRows = [];
    this.updateTotalFields(this.proposedFundingLineGridApi, this.proposedFundingLineRows, 'Proposed');
    this.loadDataFromUfr();
    this.proposedFundingLineGridApi.hideOverlay();
  }

  onTotalRevisedFundingLineGridIsReady(api: GridApi) {
    this.totalRevisedFundingLineGridApi = api;
    this.totalRevisedFundingLineGridApi.setHeaderHeight(0);
    this.totalRevisedFundingLineRows = [];
    this.updateTotalFields(
      this.totalRevisedFundingLineGridApi,
      this.totalRevisedFundingLineRows,
      'Total Revised Funding'
    );
    this.totalRevisedFundingLineGridApi.hideOverlay();
  }

  onApprovedFundingLineGridIsReady(api: GridApi) {
    this.approvedFundingLineGridApi = api;
    this.approvedFundingLineGridApi.setHeaderHeight(0);
    this.approvedFundingLineRows = [];
    this.updateTotalFields(this.approvedFundingLineGridApi, this.approvedFundingLineRows, 'Approved');
    this.approvedFundingLineGridApi.hideOverlay();
  }

  private loadDropDownValues() {
    this.propertyService.getByType(PropertyType.APPROPRIATION).subscribe((res: any) => {
      this.appnOptions = res.properties.map(x => x.value).map(x => x.appropriation);
    });
    this.propertyService.getByType(PropertyType.BA_BLIN).subscribe((res: any) => {
      this.allBaBlins = res.properties.map(x => x.value);
    });
    this.propertyService.getByType(PropertyType.SAG).subscribe((res: any) => {
      this.sagOptions = res.properties.map(x => x.value).map(x => x.sag);
    });
    this.propertyService.getByType(PropertyType.WORK_UNIT_CODE).subscribe((res: any) => {
      this.wucdOptions = res.properties.map(x => x.value).map(x => x.workUnitCode);
    });
    this.propertyService.getByType(PropertyType.EXPENDITURE_TYPE).subscribe((res: any) => {
      this.expTypeOptions = res.properties.map(x => x.value).map(x => x.code);
    });
  }

  private loadDataFromProgram() {
    this.pomService
      .getPomById(this.ufr.containerId)
      .pipe(
        switchMap((resp: any) => {
          const pom = resp.result as Pom;
          if (pom.status === PomStatus.OPEN) {
            return this.workspaceService.getByContainerIdAndVersion(pom.id, 1).pipe(
              map((workspaceResp: any) => {
                const workspace = workspaceResp.result as Workspace;
                return of(workspace.id);
              })
            );
          } else {
            return of(pom.id);
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap((containerId: string) => {
          return this.programmingService
            .findByShortNameAndContainerId(containerId, this.ufr.shortName)
            .pipe(map(resp => resp.result as Program));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap(program => {
          return this.fundingLineService
            .obtainFundingLinesByContainerId(program.id)
            .pipe(map(fundingLines => this.convertFundsToFiscalYear(fundingLines, false)));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .subscribe(resp => {
        const fundingLines = resp as FundingData[];
        this.currentFundingLineRows.push(...fundingLines);
        if (this.currentFundingLineGridApi) {
          this.updateTotalFields(this.currentFundingLineGridApi, this.currentFundingLineRows, 'Current');
          this.currentFundingLineGridApi.setRowData(this.currentFundingLineRows);
          this.currentFundingLineGridApi.hideOverlay();
        }
        this.loadDataForTotalRevisedFunding();
        this.loadDataForApprovedFunding();
        this.drawLineChart();
      });
  }

  private loadDataFromUfr() {
    this.fundingLineService.obtainFundingLinesByContainerId(this.ufr.id).subscribe(resp => {
      const proposedFundingLine = resp.result as FundingLine[];
      this.proposedFundingLineRows = [];
      proposedFundingLine?.forEach(fundingLine => {
        this.proposedFundingLineRows.push(this.fundingLineToFundingData(fundingLine, true));
      });
      this.updateTotalFields(this.proposedFundingLineGridApi, this.proposedFundingLineRows, 'Proposed');
      this.proposedFundingLineGridApi.setRowData(this.proposedFundingLineRows);
      this.proposedFundingLineGridApi.hideOverlay();
      if (!this.showCurrentFundingGrid) {
        this.loadDataForTotalRevisedFunding();
        this.loadDataForApprovedFunding();
        this.drawLineChart();
      }
    });
  }

  private loadDataForTotalRevisedFunding() {
    if (this.totalRevisedFundingLineGridApi) {
      this.totalRevisedFundingLineRows = [];
      this.currentFundingLineRows.forEach(fundingLine => {
        this.totalRevisedFundingLineRows.push({
          appropriation: fundingLine.appropriation,
          baOrBlin: fundingLine.baOrBlin,
          sag: fundingLine.sag,
          wucd: fundingLine.wucd,
          expenditureType: fundingLine.expenditureType,
          py1: 0,
          py: 0,
          cy: 0,
          by: fundingLine.by,
          by1: fundingLine.by1,
          by2: fundingLine.by2,
          by3: fundingLine.by3,
          by4: fundingLine.by4,
          ctc: 0,
          fyTotal: 0,
          action: null
        });
      });
      this.proposedFundingLineRows.forEach(fundingLine => {
        const totalRevisedFunding = this.totalRevisedFundingLineRows.find(
          fl =>
            fl.appropriation === fundingLine.appropriation &&
            fl.baOrBlin === fundingLine.baOrBlin &&
            fl.sag === fundingLine.sag &&
            fl.wucd === fundingLine.wucd &&
            fl.expenditureType === fundingLine.expenditureType
        );
        if (totalRevisedFunding) {
          totalRevisedFunding.by += fundingLine.by ?? 0;
          totalRevisedFunding.by1 += fundingLine.by1 ?? 0;
          totalRevisedFunding.by2 += fundingLine.by2 ?? 0;
          totalRevisedFunding.by3 += fundingLine.by3 ?? 0;
          totalRevisedFunding.by4 += fundingLine.by4 ?? 0;
        } else {
          this.totalRevisedFundingLineRows.push({
            appropriation: fundingLine.appropriation,
            baOrBlin: fundingLine.baOrBlin,
            sag: fundingLine.sag,
            wucd: fundingLine.wucd,
            expenditureType: fundingLine.expenditureType,
            py1: 0,
            py: 0,
            cy: 0,
            by: fundingLine.by,
            by1: fundingLine.by1,
            by2: fundingLine.by2,
            by3: fundingLine.by3,
            by4: fundingLine.by4,
            ctc: 0,
            fyTotal: 0,
            action: null
          });
        }
      });
    }
    this.updateTotalFields(this.totalRevisedFundingLineGridApi, this.totalRevisedFundingLineRows, 'Total Revised');

    this.totalRevisedFundingLineGridApi.setRowData(this.totalRevisedFundingLineRows);
    this.totalRevisedFundingLineGridApi.hideOverlay();
  }

  private loadDataForApprovedFunding() {
    if (this.approvedFundingLineGridApi) {
      if (!this.approvedFundingLineRows?.length) {
        this.currentFundingLineRows.forEach(fundingLine => {
          this.approvedFundingLineRows.push({
            appropriation: fundingLine.appropriation,
            baOrBlin: fundingLine.baOrBlin,
            sag: fundingLine.sag,
            wucd: fundingLine.wucd,
            expenditureType: fundingLine.expenditureType,
            py1: 0,
            py: 0,
            cy: 0,
            by: 0,
            by1: 0,
            by2: 0,
            by3: 0,
            by4: 0,
            ctc: 0,
            fyTotal: 0,
            action: null
          });
        });
      }
      this.updateTotalFields(this.approvedFundingLineGridApi, this.approvedFundingLineRows, 'Approved');

      this.approvedFundingLineGridApi.setRowData(this.approvedFundingLineRows);
      this.approvedFundingLineGridApi.hideOverlay();
    }
  }

  private convertFundsToFiscalYear(response: any, hasAction: boolean) {
    const ret: FundingData[] = [];
    if (response.result) {
      response.result.forEach(fundingLine => {
        ret.push(this.fundingLineToFundingData(fundingLine, hasAction));
      });
    }
    return ret;
  }

  private fundingLineToFundingData(fundingLine: FundingLine, hasAction: boolean) {
    const funds = fundingLine.funds;
    const fundingData = { ...fundingLine } as FundingData;
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName = (i < this.pomYear - 1
        ? 'PY' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
        : i >= this.pomYear
        ? 'BY' + (i === this.pomYear ? '' : i - this.pomYear)
        : 'CY'
      ).toLowerCase();
      fundingData[headerName] = parseInt(((funds[i] ?? 0) / 1000).toString(), 10);
    }
    if (hasAction) {
      fundingData.action = fundingLine.userCreated ? this.actionState.VIEW : this.actionState.VIEW_NO_DELETE;
    }
    return fundingData;
  }

  private convertFiscalYearToFunds(fundingLine: FundingData, convertToThousand = true) {
    const fundingLineToSave: FundingLine = { ...fundingLine };
    fundingLineToSave.funds = {};
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName = (i < this.pomYear - 1
        ? 'PY' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
        : i >= this.pomYear
        ? 'BY' + (i === this.pomYear ? '' : i - this.pomYear)
        : 'CY'
      ).toLowerCase();
      fundingLineToSave.funds[i] = Number(fundingLine[headerName]) * (convertToThousand ? 1000 : 1);
    }
    fundingLineToSave.ctc = Number(fundingLine.ctc);
    return fundingLineToSave;
  }

  onProposedFundingLineCellAction(cellAction: DataGridMessage) {
    switch (cellAction.message) {
      case 'save':
        this.saveRow(cellAction.rowIndex);
        break;
      case 'edit':
        if (!this.proposedFundingLineRowDataState.isEditMode) {
          this.editRow(cellAction.rowIndex, true);
        }
        break;
      case 'delete-row':
        if (!this.proposedFundingLineRowDataState.isEditMode) {
          this.deleteDialog.bodyText =
            'By deleting this row, you will not only delete the row on this tab, ' +
            'but also any row associated to this funding line on the Scheduling and Asset tabs.  ' +
            'Are you sure you want to continue?';
          this.displayDeleteDialog(cellAction, this.deleteRow.bind(this));
        }
        break;
      case 'cancel':
        this.performNonSummaryCancel(cellAction.rowIndex);
        break;
    }
  }

  private performNonSummaryCancel(rowIndex: number) {
    if (this.proposedFundingLineRowDataState.isEditMode && !this.proposedFundingLineRowDataState.isAddMode) {
      this.cancelRow(rowIndex);
    } else {
      this.deleteRow(rowIndex);
    }
  }

  private setupCurrentFundingLineGrid() {
    const columnGroups: any[] = [];
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++, x++) {
      const headerName =
        i < this.pomYear - 1
          ? 'PY' + (this.pomYear - i === 2 ? '' : '-' + (this.pomYear - i - 2))
          : i >= this.pomYear
          ? 'BY' + (i === this.pomYear ? '' : '+' + (i - this.pomYear))
          : 'CY';
      const fieldPrefix = headerName.toLowerCase().replace('+', '').replace('-', '');
      columnGroups.push({
        groupId: 'main-header',
        headerName,
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 4 + x,
            headerName: 'FY' + (i % 100),
            field: fieldPrefix,
            editable: i >= this.pomYear,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['numeric-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
            minWidth: 75,
            cellEditor: NumericCellEditor.create({
              returnUndefinedOnZero: false,
              allowedCharacters: AllowedCharacters.DIGITS_ONLY
            }),
            valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
          }
        ]
      });
    }
    this.currentFundingLineColumnsDefinition = [
      {
        headerName: 'Table',
        field: 'table',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['text-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 115,
        maxWidth: 115,
        valueSetter: params => {
          return 'Current';
        }
      },
      {
        groupId: 'main-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'APPN',
            field: 'appropriation',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.appnOptions]
              };
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)]
              };
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...new Set(this.sagOptions)]
              };
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.wucdOptions]
              };
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.expTypeOptions]
              };
            }
          }
        ]
      },
      ...columnGroups,
      {
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        cellEditor: NumericCellEditor.create({
          returnUndefinedOnZero: false,
          allowedCharacters: AllowedCharacters.DIGITS_ONLY
        }),
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => 'regular-cell',
        cellRendererFramework: FundingLineActionCellRendererComponent,
        minWidth: 100,
        maxWidth: 100
      }
    ];
    this.proposedFundingLineColumnsDefinition = [
      {
        headerName: 'Table',
        field: 'table',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['text-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 115,
        maxWidth: 115,
        valueSetter: params => {
          return 'Proposed';
        }
      },
      {
        groupId: 'main-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'APPN',
            field: 'appropriation',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.appnOptions]
              };
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)]
              };
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...new Set(this.sagOptions)]
              };
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.wucdOptions]
              };
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.expTypeOptions]
              };
            }
          }
        ]
      },
      ...columnGroups,
      {
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        cellEditor: NumericCellEditor.create({
          returnUndefinedOnZero: false,
          allowedCharacters: AllowedCharacters.DIGITS_ONLY
        }),
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => 'regular-cell',
        cellRendererFramework: FundingLineActionCellRendererComponent,
        minWidth: 100,
        maxWidth: 100
      }
    ];
    this.totalRevisedFundingLineColumnsDefinition = [
      {
        headerName: 'Table',
        field: 'table',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['text-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 115,
        maxWidth: 115,
        valueSetter: params => {
          return 'Total Revised';
        }
      },
      {
        groupId: 'main-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'APPN',
            field: 'appropriation',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.appnOptions]
              };
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)]
              };
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...new Set(this.sagOptions)]
              };
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.wucdOptions]
              };
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.expTypeOptions]
              };
            }
          }
        ]
      },
      ...columnGroups,
      {
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        cellEditor: NumericCellEditor.create({
          returnUndefinedOnZero: false,
          allowedCharacters: AllowedCharacters.DIGITS_ONLY
        }),
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => 'regular-cell',
        cellRendererFramework: FundingLineActionCellRendererComponent,
        minWidth: 100,
        maxWidth: 100
      }
    ];
    this.approvedFundingLineColumnsDefinition = [
      {
        headerName: 'Table',
        field: 'table',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['text-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 115,
        miaxWidth: 115,
        valueSetter: params => {
          return 'Approved';
        }
      },
      {
        groupId: 'main-header',
        headerName: 'Funds in $K',
        headerClass: this.headerClassFunc,
        marryChildren: true,
        children: [
          {
            colId: 0,
            headerName: 'APPN',
            field: 'appropriation',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.appnOptions]
              };
            }
          },
          {
            colId: 1,
            headerName: 'BA/BLIN',
            field: 'baOrBlin',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: {
              display: 'flex',
              'align-items': 'center',
              'justify-content': 'flex-start',
              'white-space': 'normal'
            },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.allBaBlins.filter(x => params.data.appropriation === x.appropriation).map(x => x.code)]
              };
            }
          },
          {
            colId: 2,
            headerName: 'SAG',
            field: 'sag',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...new Set(this.sagOptions)]
              };
            }
          },
          {
            colId: 3,
            headerName: 'WUCD',
            field: 'wucd',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.wucdOptions]
              };
            }
          },
          {
            colId: 4,
            headerName: 'EXP Type',
            field: 'expenditureType',
            editable: params => this.proposedFundingLineRowDataState.isAddMode,
            suppressMovable: true,
            filter: false,
            sortable: false,
            suppressMenu: true,
            cellClass: params => ['text-class', 'regular-cell'],
            cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-start' },
            maxWidth: 110,
            minWidth: 110,
            cellEditorFramework: DropdownCellRendererComponent,
            cellEditorParams: params => {
              return {
                values: [...this.expTypeOptions]
              };
            }
          }
        ]
      },
      ...columnGroups,
      {
        headerName: 'FY Total',
        field: 'fyTotal',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'CTC',
        field: 'ctc',
        editable: true,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => ['numeric-class', 'regular-cell'],
        cellStyle: { display: 'flex', 'align-items': 'center', 'justify-content': 'flex-end' },
        minWidth: 75,
        cellEditor: NumericCellEditor.create({
          returnUndefinedOnZero: false,
          allowedCharacters: AllowedCharacters.DIGITS_ONLY
        }),
        valueFormatter: params => this.currencyFormatter(params.data[params.colDef.field])
      },
      {
        headerName: 'Actions',
        field: 'action',
        editable: false,
        suppressMovable: true,
        filter: false,
        sortable: false,
        suppressMenu: true,
        cellClass: params => 'regular-cell',
        cellRendererFramework: FundingLineActionCellRendererComponent,
        minWidth: 100,
        maxWidth: 100
      }
    ];
    this.updateTotalFields(this.currentFundingLineGridApi, this.currentFundingLineRows, 'Current');
  }

  currencyFormatter(params) {
    return (
      '$ ' +
      Number(params)
        .toString()
        .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
    );
  }

  onProposedFundingLineRowAdd(params) {
    if (this.proposedFundingLineRowDataState.isEditMode) {
      return;
    }
    this.proposedFundingLineRows.push({
      appropriation: null,
      baOrBlin: null,
      sag: null,
      wucd: null,
      expenditureType: null,
      userCreated: true,

      py1: 0,
      py: 0,
      cy: 0,
      by: 0,
      by1: 0,
      by2: 0,
      by3: 0,
      by4: 0,

      fyTotal: 0,
      ctc: 0,
      action: this.actionState.EDIT
    });
    this.proposedFundingLineRowDataState.isAddMode = true;
    this.proposedFundingLineGridApi.setRowData(this.proposedFundingLineRows);
    this.proposedFundingLineGridApi.hideOverlay();
    this.editRow(this.proposedFundingLineRows.length - 1);
  }

  private saveRow(rowIndex: number) {
    this.proposedFundingLineGridApi.stopEditing();
    const canSave = this.validateProposedFundingLineRowData(rowIndex);
    if (canSave) {
      this.prepareProposedFundingLineSave(rowIndex);
    } else {
      this.editRow(rowIndex);
    }
  }

  private prepareProposedFundingLineSave(rowIndex: number) {
    const row = this.proposedFundingLineRows[rowIndex];
    const fundingLine = this.convertFiscalYearToFunds(row);
    fundingLine.containerId = this.ufr.id;
    if (this.proposedFundingLineRowDataState.isAddMode) {
      this.performProposedFundingLineSave(
        this.fundingLineService.createFundingLineToUfr.bind(this.fundingLineService),
        fundingLine,
        rowIndex
      );
    } else {
      this.performProposedFundingLineSave(
        this.fundingLineService.updateFundingLineToUfr.bind(this.fundingLineService),
        fundingLine,
        rowIndex
      );
    }
  }

  private performProposedFundingLineSave(
    saveOrUpdate: (fundingLine: FundingLine) => Observable<any>,
    fundingLine: FundingLine,
    rowIndex: number
  ) {
    saveOrUpdate(fundingLine)
      .pipe(
        map(resp => {
          return this.fundingLineToFundingData(resp.result, true);
        })
      )
      .subscribe(
        fundingData => {
          this.proposedFundingLineRows[rowIndex] = fundingData;
          this.updateTotalFields(this.proposedFundingLineGridApi, this.proposedFundingLineRows, 'Proposed');
          this.loadDataForTotalRevisedFunding();
          this.drawLineChart();
          this.ufr.programStatus = ProgramStatus.SAVED;
          this.viewProposedFundingLineMode(rowIndex);
        },
        error => {
          this.dialogService.displayDebug(error);
          this.editRow(rowIndex);
        }
      );
  }

  private updateTotalFields(gridApi: GridApi, rows: FundingData[], tableName: string) {
    const totalRow = {
      table: tableName,
      appropriationSummary: 'Total Funding',
      appropriation: 'Total Funding',

      py1: 0,
      py: 0,
      cy: 0,
      by: 0,
      by1: 0,
      by2: 0,
      by3: 0,
      by4: 0,

      fyTotal: 0,
      ctc: 0,

      action: null
    };
    rows.forEach(row => {
      let total = 0;
      row.ctc = row.ctc ? row.ctc : 0;
      for (let i = this.pomYear - 3; i < this.pomYear + 5; i++) {
        const field =
          i < this.pomYear - 1
            ? 'py' + (this.pomYear - i === 2 ? '' : this.pomYear - i - 2)
            : i >= this.pomYear
            ? 'by' + (i === this.pomYear ? '' : i - this.pomYear)
            : 'cy';
        totalRow[field] += Number(row[field]);
        if (i >= this.pomYear) {
          total += Number(row[field]);
        }
      }
      row.fyTotal = total;
      totalRow.ctc += Number(row.ctc);
      totalRow.fyTotal += Number(row.fyTotal);
    });
    if (gridApi) {
      gridApi.setPinnedTopRowData([{ ...totalRow }]);
      gridApi.hideOverlay();
    }
  }

  private validateProposedFundingLineRowData(rowIndex: any) {
    const row = this.proposedFundingLineRows[rowIndex];
    let errorMessage = '';
    if (!row.appropriation || !row.appropriation?.length || row.appropriation?.toLowerCase() === 'select') {
      errorMessage = 'Please, select an APPN.';
    } else if (!row.baOrBlin || !row.baOrBlin?.length || row.baOrBlin?.toLowerCase() === 'select') {
      errorMessage = 'Please, select a BA/BLIN.';
    } else if (row.userCreated) {
      if (!row.sag || !row.sag?.length || row.sag?.toLowerCase() === 'select') {
        errorMessage = 'Please, select a SAG.';
      } else if (!row.wucd || !row.wucd?.length || row.wucd?.toLowerCase() === 'select') {
        errorMessage = 'Please, select a WUCD.';
      } else if (
        !row.expenditureType ||
        !row.expenditureType?.length ||
        row.expenditureType?.toLowerCase() === 'select'
      ) {
        errorMessage = 'Please, select a EXP Type.';
      }
    }

    if (
      this.proposedFundingLineRows.some((fundingLine, idx) => {
        return (
          idx !== rowIndex &&
          fundingLine.appropriation === row.appropriation &&
          fundingLine.baOrBlin === row.baOrBlin &&
          fundingLine.sag === row.sag &&
          fundingLine.wucd === row.wucd &&
          fundingLine.expenditureType === row.expenditureType
        );
      })
    ) {
      errorMessage = 'You have repeated an existing funding line. Please delete this row and edit the existing line.';
    }
    if (errorMessage.length) {
      this.dialogService.displayError(errorMessage);
    }
    return !errorMessage.length;
  }

  private cancelRow(rowIndex: number) {
    this.proposedFundingLineRows[rowIndex] = this.proposedFundingLineRowDataState.currentEditingRowData;
    this.viewProposedFundingLineMode(rowIndex);
  }

  private editRow(rowIndex: number, updatePreviousState?: boolean) {
    if (updatePreviousState) {
      this.proposedFundingLineRowDataState.currentEditingRowData = { ...this.proposedFundingLineRows[rowIndex] };
    }
    this.editProposedFundingLineMode(rowIndex);
    this.setupAppnDependency();
  }

  private deleteRow(rowIndex: number) {
    const fundingLineId = this.proposedFundingLineRows[rowIndex].id;
    if (fundingLineId) {
      this.fundingLineService.removeFundingLineByIdForUfr(fundingLineId).subscribe(
        () => {
          this.performProposedFundingLineDelete(rowIndex);
          this.updateTotalFields(this.proposedFundingLineGridApi, this.proposedFundingLineRows, 'Proposed');
          this.loadDataForTotalRevisedFunding();
          this.drawLineChart();
        },
        error => {
          this.dialogService.displayDebug(error);
        }
      );
    } else {
      this.performProposedFundingLineDelete(rowIndex);
    }
  }

  private performProposedFundingLineDelete(rowIndex: number) {
    this.proposedFundingLineRows.splice(rowIndex, 1);
    this.proposedFundingLineRowDataState.currentEditingRowIndex = 0;
    this.proposedFundingLineRowDataState.isEditMode = false;
    this.proposedFundingLineRowDataState.isAddMode = false;
    this.proposedFundingLineGridApi.stopEditing();
    this.proposedFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.proposedFundingLineGridApi.setRowData(this.proposedFundingLineRows);
    this.proposedFundingLineGridApi.hideOverlay();
  }

  private viewProposedFundingLineMode(rowIndex: number) {
    this.proposedFundingLineRowDataState.currentEditingRowIndex = -1;
    this.proposedFundingLineRowDataState.isEditMode = false;
    this.proposedFundingLineRowDataState.isAddMode = false;
    this.proposedFundingLineGridApi.stopEditing();

    this.proposedFundingLineRows[rowIndex].action = this.proposedFundingLineRows[rowIndex].userCreated
      ? this.actionState.VIEW
      : this.actionState.VIEW_NO_DELETE;
    this.proposedFundingLineRows.forEach(row => {
      row.isDisabled = false;
    });
    this.proposedFundingLineGridApi.setRowData(this.proposedFundingLineRows);
    this.proposedFundingLineGridApi.hideOverlay();
    this.totalRevisedFundingLineGridApi.hideOverlay();
  }

  private editProposedFundingLineMode(rowIndex: number) {
    this.proposedFundingLineRowDataState.currentEditingRowIndex = rowIndex;
    this.proposedFundingLineRowDataState.isEditMode = true;
    this.proposedFundingLineRows[rowIndex].action = this.actionState.EDIT;
    this.proposedFundingLineRows.forEach((row, index) => {
      if (rowIndex !== index) {
        row.isDisabled = true;
      }
    });
    this.proposedFundingLineGridApi.setRowData(this.proposedFundingLineRows);
    this.proposedFundingLineGridApi.hideOverlay();
    this.proposedFundingLineGridApi.startEditingCell({
      rowIndex,
      colKey: '0'
    });
  }

  headerClassFunc(params: any) {
    let isMainHeader = false;
    let column = params.column ? params.column : params.columnGroup;
    while (column) {
      if (column.getDefinition().groupId === 'main-header') {
        isMainHeader = true;
      }
      column = column.getParent();
    }
    if (isMainHeader) {
      return 'main-header';
    } else {
      return null;
    }
  }

  onProposedFundingLineMouseDown(mouseEvent: MouseEvent) {
    this.undoProposedFundingLineCells();
  }

  private undoProposedFundingLineCells() {
    if (this.proposedFundingLineRowDataState.isEditMode) {
      this.proposedFundingLineGridApi.startEditingCell({
        rowIndex: this.proposedFundingLineRowDataState.currentEditingRowIndex,
        colKey: '0'
      });
      this.setupAppnDependency();
    }
  }

  private displayDeleteDialog(cellAction: DataGridMessage, deleteFunction: (rowIndex: number) => void) {
    this.deleteDialog.cellAction = cellAction;
    this.deleteDialog.delete = deleteFunction;
    this.deleteDialog.display = true;
  }

  onCancelDeleteDialog() {
    this.closeDeleteDialog();
  }

  onDeleteData() {
    this.deleteDialog.delete(this.deleteDialog.cellAction.rowIndex);
    this.closeDeleteDialog();
  }

  private closeDeleteDialog() {
    this.deleteDialog.cellAction = null;
    this.deleteDialog.delete = null;
    this.deleteDialog.display = false;
  }

  setupAppnDependency() {
    const appnCell = this.proposedFundingLineGridApi.getEditingCells()[0];
    const baBlinCell = this.proposedFundingLineGridApi.getEditingCells()[1];

    const appnCellEditor = this.proposedFundingLineGridApi.getCellEditorInstances({
      columns: [appnCell.column]
    })[0] as any;

    const bablinCellEditor = this.proposedFundingLineGridApi.getCellEditorInstances({
      columns: [baBlinCell.column]
    })[0] as any;

    const appnDropdownComponent = appnCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;
    if (appnDropdownComponent) {
      const baBlinDropdownComponent = bablinCellEditor._frameworkComponentInstance as DropdownCellRendererComponent;

      appnDropdownComponent.change.subscribe(() => {
        const list = [
          ...this.allBaBlins.filter(x => appnDropdownComponent.selectedValue === x.appropriation).map(x => x.code)
        ];
        baBlinDropdownComponent.updateList(list);
      });
    }
  }

  drawLineChart() {
    const data = this.lineChartData();
    this.chartData.dataTable = data;
    if (this.chart && this.chart.wrapper) {
      this.chart.draw();
    }
  }

  lineChartData() {
    const data: any[][] = [['Fiscal Year', 'Current Funding', 'Revised Funding']];
    const currentFunds: number[] = [];
    const fundingLineRows = this.currentFundingLineRows;
    if (fundingLineRows.length) {
      fundingLineRows.forEach(row => {
        const fundingLine = this.convertFiscalYearToFunds(row, false);
        for (const year of Object.keys(fundingLine.funds)) {
          currentFunds[year] = currentFunds[year] ?? 0;
          currentFunds[year] += Number(fundingLine.funds[year]) ?? 0;
        }
      });
    } else {
      for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
        currentFunds[i] = 0;
      }
    }
    const revisedFunds: number[] = [];
    const revisedFundingLineRows = this.totalRevisedFundingLineRows;
    if (revisedFundingLineRows.length) {
      revisedFundingLineRows.forEach(row => {
        const fundingLine = this.convertFiscalYearToFunds(row, false);
        for (const year of Object.keys(fundingLine.funds)) {
          revisedFunds[year] = revisedFunds[year] ?? 0;
          revisedFunds[year] += Number(fundingLine.funds[year]) ?? 0;
        }
      });
    } else {
      for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
        revisedFunds[i] = 0;
      }
    }
    for (let i = this.pomYear - 3, x = 0; i < this.pomYear + 5; i++) {
      data.push(['FY' + (i % 100), currentFunds[i] ?? 0, revisedFunds[i] ?? 0]);
    }
    return data;
  }
}

export interface RowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: any;
}

export interface DeleteDialogInterface {
  title: string;
  bodyText?: string;
  display?: boolean;
  cellAction?: DataGridMessage;
  delete?: (rowIndex: number) => void;
}
