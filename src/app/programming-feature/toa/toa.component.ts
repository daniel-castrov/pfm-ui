import { Component, OnInit, ViewChild } from '@angular/core';
import { ListItem } from '../../pfm-common-models/ListItem';
import { ListItemHelper } from 'src/app/util/ListItemHelper';
import { PomService } from '../services/pom-service';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { FormatterUtil } from 'src/app/util/formatterUtil';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { CreateProgrammingCommunityGraphComponent } from '../create-programming/create-programming-community-graph/create-programming-community-graph.component';
import { CreateProgrammingOrganizationGraphComponent } from '../create-programming/create-programming-organization-graph/create-programming-organization-graph.component';
import { CellPosition, Column, ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { Organization } from '../../pfm-common-models/Organization';
import { Pom } from '../models/Pom';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { NumericCellEditor } from '../../ag-grid/cell-editors/NumericCellEditor';
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { TOA } from '../models/TOA';
import { Action } from '../../pfm-common-models/Action';
import { OrganizationService } from '../../services/organization-service';
import { Router } from '@angular/router';
import { ToastService } from '../../pfm-coreui/services/toast.service';
import { VisibilityService } from '../../services/visibility-service';
import { AppModel } from '../../pfm-common-models/AppModel';
import { PomStatus } from '../models/enumerations/pom-status.model';

@Component({
  selector: 'pfm-toa',
  templateUrl: './toa.component.html',
  styleUrls: ['./toa.component.scss']
})
export class ToaComponent implements OnInit {
  @ViewChild(TabsetComponent)
  tabset: TabsetComponent;
  @ViewChild(CreateProgrammingCommunityGraphComponent)
  communityGraph: CreateProgrammingCommunityGraphComponent;
  @ViewChild(CreateProgrammingOrganizationGraphComponent)
  organizationGraph: CreateProgrammingOrganizationGraphComponent;

  pomYears: ListItem[];
  defaultYear: ListItem;

  id = 'create-programming-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: ListItem;
  currentYear: number;
  byYear: any;
  programYearSelected: any;
  showUploadDialog: boolean;
  programBudgetData: boolean;
  communityGridApi: GridApi;
  orgGridApi: GridApi;
  commColumnApi: ColumnApi;
  orgColumnApi: ColumnApi;
  communityColumns: any[];
  communityData: any[];
  orgColumns: any[];
  orgData: any[];
  subToasData: any[];
  tableHeaders: Array<string>;
  orgs: Organization[];
  uploadedFileId: string;
  communityGraphData: any[] = [[]];
  organizationGraphData: any[] = [[]];
  loadBaseline: boolean;
  pom: Pom;
  activeTab: TabDirective;
  orgColors: string[] = [];
  currentRowDataState: ToaRowDataStateInterface = {};

  saveConfirmationDlg = {
    title: 'Caution',
    bodyText: `Saving the TOA values after the Programming phase has been opened will not only update the TOA values,
    but will also revert all Program Requests back to the "Funds Requestor Saved" state.
    Do you want to continue?
    `,
    continueAction: null,
    display: false
  };

  constructor(
    public appModel: AppModel,
    private organizationService: OrganizationService,
    private pomService: PomService,
    private dialogService: DialogService,
    private router: Router,
    private toastService: ToastService,
    private visibilityService: VisibilityService
  ) {
    this.orgColors['ODASD(CBD)'] = '#dc3e9e';
    this.orgColors['PAIO'] = '#dc3912';
    this.orgColors['ECBC'] = '#dcdb2b';
    this.orgColors['DUSA-TE'] = '#3366cc';
    this.orgColors['JSTO-CBD'] = '#ff9900';
    this.orgColors['JPEO-CBRND'] = '#990099';
    this.orgColors['JRO-CBRND'] = '#109618';

    this.subToasData = [];

    this.organizationService.getAll().subscribe(
      resp => {
        this.orgs = (resp as any).result;
      },
      error => {}
    );
  }

  ngOnInit() {
    this.busy = true;
    this.setupVisibility();
    this.byYear = FormatterUtil.getCurrentFiscalYear() + 2;
    this.programYearSelected = 'undefined';
    this.pomService.getPomYearsByStatus(['CREATED', 'OPEN', 'LOCKED', 'CLOSED']).subscribe(
      resp => {
        const years: string[] = (resp as any).result.map(String);
        this.pomYears = ListItemHelper.generateListItemFromArray(years);
      },
      error => {
        this.dialogService.displayInfo(error.error.error);
      },
      () => {
        const yearItem = this.pomYears.find(x => this.byYear.toString() === x.id);
        if (yearItem) {
          this.selectedYear = new ListItem();
          this.selectedYear.id = this.byYear.toString();
          this.selectedYear.name = this.byYear.toString();
          this.selectedYear.value = this.byYear.toString();
          this.yearSelected(yearItem);
        }
        this.busy = false;
      }
    );
  }

  setupVisibility() {
    this.visibilityService.isCurrentlyVisible('toa-component').subscribe(response => {
      if (!this.appModel['visibilityDef']) {
        this.appModel['visibilityDef'] = {};
      }
      if ((response as any).result) {
        this.appModel['visibilityDef']['toa-component'] = (response as any).result;
      }
    });
  }

  yearSelected(year: ListItem): void {
    this.selectedYear = year;
    this.programYearSelected = +year.value;
    this.loadBaseline = false;
    this.programBudgetData = true;

    this.initGrids(this.programYearSelected);
    this.getPomFromPB(this.programYearSelected);
  }

  initGrids(selectedYear) {
    this.clearGrids();
    // set the column definitions to community and Organization grid
    this.communityColumns = this.setAgGridColDefs('Community', selectedYear);
    this.orgColumns = this.setAgGridColDefs('Organization', selectedYear);
  }

  clearGrids() {
    if (this.orgGridApi !== undefined) {
      this.orgGridApi.setColumnDefs([]);
      this.orgGridApi.setRowData([]);
    }

    if (this.communityGridApi !== undefined) {
      this.communityGridApi.setColumnDefs([]);
      this.communityGridApi.setRowData([]);
    }
  }

  getPomFromPB(selectedYear: any) {
    this.busy = true;
    this.pomService.getPomForYear(selectedYear).subscribe(
      resp => {
        this.busy = false;
        this.pom = (resp as any).result;
        this.loadGrids(selectedYear);
      },
      error => {
        this.busy = false;
      }
    );
  }

  buildCommunityToaRows(fy: number) {
    const toarow = {};

    // BaseLine
    let row = {};
    row['orgid'] = '<strong><span>Baseline</span></strong>';
    this.pom.communityToas.forEach(toa => {
      row[toa.year] = toa.amount;
    });

    const actions = this.getCommActions();
    this.communityData.push(row);

    // Community Toas
    row = {};
    row['orgid'] = '<strong><span>TOA</span></strong>';
    toarow['orgid'] = 'sub TOA Total Goal';
    this.pom.communityToas.forEach((toa: TOA) => {
      row[toa.year] = toa.amount;
    });

    for (let i = 0; i < 5; i++) {
      if (row[fy + i] === undefined) {
        row[fy + i] = 0;
      }
      toarow[fy + i] = row[fy + i];
    }
    row['Communityactions'] = actions;
    this.communityData.push(row);

    toarow['orgid'] = 'sub TOA Total Goal';
    this.subToasData.push(toarow);

    this.communityData.forEach(commRow => {
      for (let i = 0; i < 5; i++) {
        if (commRow[fy + i] === undefined) {
          commRow[fy + i] = 0;
        }
      }
    });
  }

  buildOrgToaRows(fy: number) {
    let row = null;
    const toarow = this.subToasData[0];
    // Org TOAs
    Object.keys(this.pom.orgToas).forEach(key => {
      row = {};
      row['orgid'] = '<strong><span>' + this.getOrgName(key) + '</span></strong>';
      this.pom.orgToas[key].forEach((toa: TOA) => {
        row[toa.year] = toa.amount;
      });

      row['Organizationactions'] = this.getOrgActions();
      this.orgData.push(row);
    });

    this.orgData.forEach(orgRow => {
      for (let i = 0; i < 5; i++) {
        if (orgRow[fy + i] === undefined) {
          orgRow[fy + i] = 0;
        }
      }
    });

    const subtoarow = this.calculateSubToaTotals();

    this.tableHeaders = [];
    this.tableHeaders.push('orgid');
    for (let i = 0; i < 5; i++) {
      this.tableHeaders.push((fy + i).toString());
    }

    this.orgData.push(toarow);
    this.orgData.push(subtoarow);

    subtoarow['orgid'] = 'sub-TOA Total Actual';
    this.subToasData.push(subtoarow);

    let toaDeltarow = {};
    toaDeltarow = this.calculateDeltaRow(subtoarow, toarow);

    this.orgData.push(toaDeltarow);
    toaDeltarow['orgid'] = 'Delta';
    this.subToasData.push(toaDeltarow);
  }

  loadGrids(fy: number) {
    this.communityData = [];
    this.orgData = [];
    this.subToasData = [];

    this.buildCommunityToaRows(fy);
    this.buildOrgToaRows(fy);

    this.currentYear = fy;
    this.tabset.tabs[0].active = true;
    this.updateCommunityGraphData(this.currentYear);
  }

  getCommActions(): Action {
    const actions = new Action();
    actions.canDelete = false;
    actions.canEdit =
      this.appModel.visibilityDef?.['toa-component']?.editToaCommunity && this.pom.status === PomStatus.OPEN;
    actions.canSave = false;
    actions.canUpload = false;
    return actions;
  }

  getOrgActions(): Action {
    const actions = new Action();
    actions.canDelete = false;
    actions.canEdit = this.canEditOrganization();
    actions.canSave = false;
    actions.canUpload = false;
    return actions;
  }

  canEditOrganization(): boolean {
    return this.appModel.visibilityDef?.['toa-component']?.editToaOrganization && this.pom.status === PomStatus.CREATED;
  }

  getOrgName(orgId: string): string {
    const matchingOrg: Organization = this.orgs.find(org => org.id === orgId);
    return matchingOrg ? matchingOrg.abbreviation : 'Unknown Organization';
  }

  getOrgId(orgName: string): string {
    const matchingOrg: Organization = this.orgs.find(org => org.abbreviation === orgName);
    return matchingOrg ? matchingOrg.id : 'Unknown Organization';
  }

  onCreateProgrammingPhase(): void {
    const year: any = this.selectedYear;
  }

  private toListItem(years: string[]): ListItem[] {
    const items: ListItem[] = [];
    for (const year of years) {
      const item: ListItem = new ListItem();
      item.id = year;
      item.name = year;
      item.value = year;
      items.push(item);
    }
    return items;
  }

  private setAgGridColDefs(column1Name: string, fy: number): any {
    const colDefs = [];
    colDefs.push({
      headerName: column1Name,
      suppressMenu: true,
      field: 'orgid',
      minWidth: 140,
      editable: false,
      pinned: 'left',
      colSpan(params) {
        return params.value === '1' ? 7 : 1;
      },
      cellRenderer: params => params.value,
      cellClass: 'text-class',
      cellStyle: params => this.getOrgColorStyle(params)
    });

    for (let i = 0; i < 5; i++) {
      colDefs.push({
        headerName: 'FY' + (fy + i - 2000),
        type: 'numericColumn',
        minWidth: 110,
        suppressMenu: true,
        field: (fy + i).toString(),
        cellEditor: NumericCellEditor.create({ returnUndefinedOnZero: false }),
        cellRenderer: params => this.negativeNumberRenderer(params),
        editable: true,
        cellClass: 'pfm-datagrid-numeric-class',
        cellStyle: { display: 'flex' }
      });
    }
    colDefs.push({
      headerName: 'FY' + (fy - 2000) + '-' + 'FY' + (fy + 4 - 2000),
      type: 'numericColumn',
      suppressMenu: true,
      field: 'total',
      minWidth: 110,
      editable: false,
      valueGetter: params => this.rowTotal(params.data, fy),
      cellRenderer: params => this.negativeNumberRenderer(params),
      cellClass: 'pfm-datagrid-numeric-class',
      cellStyle: { display: 'flex' }
    });

    colDefs.push({
      headerName: 'Actions',
      field: column1Name + 'actions',
      minWidth: 100,
      maxWidth: 100,
      cellRendererFramework: ActionCellRendererComponent
    });

    return colDefs;
  }

  // updates the community graph from grid data
  private updateCommunityGraphData(startYear: number) {
    // populate griddata
    this.communityGraphData = [['Fiscal Year', 'Community TOA', 'Average']];
    for (let row = 0; row < 5; row++) {
      const year = 'FY' + (startYear + row - 2000);
      let amount = 0;
      let change = 0;
      // if there is a year
      if (this.communityData[1][startYear + row]) {
        amount = parseInt(this.communityData[1][startYear + row], 10);
      }
      if (this.communityData[1][startYear + row - 1]) {
        const pastAmount = this.communityData[1][startYear + row - 1];
        change = (amount - pastAmount) / pastAmount;
      }
      this.communityGraphData[row + 1] = [year, amount, change];
    }

    this.communityGraph.columnChart.dataTable = this.communityGraphData;
    this.communityGraph.columnChart = Object.assign({}, this.communityGraph.columnChart);
    this.communityGraph.chartReady = true;
    if (this.communityGraph.columnChart.component) {
      this.communityGraph.columnChart.component.draw();
    }
  }

  // Update the Organization graph from grid data
  private updateOrganizationGraphData(startYear: number) {
    // Initialize starting value
    this.organizationGraphData = [[]];

    // Populate data
    const numberOfColumns = this.orgData.length - 2;
    for (let column = 0; column < numberOfColumns; column++) {
      if (column === 0) {
        // Set up graph column labels
        this.organizationGraphData[0][column] = 'Fiscal Year';
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
          this.organizationGraphData.push([]);
          this.organizationGraphData[rowIndex + 1][column] = 'FY' + (startYear + rowIndex - 2000);
        }
      } else {
        // Set data for each organization
        const organization: string = this.orgData[numberOfColumns - column - 1]['orgid'];
        this.organizationGraphData[0][column] = organization.substring(14, organization.length - 16);
        for (let rowIndex = 0; rowIndex < 5; rowIndex++) {
          this.organizationGraphData[rowIndex + 1][column] = parseInt(
            this.orgData[numberOfColumns - column - 1][startYear + rowIndex],
            10
          );
        }
      }
    }
    this.organizationGraph.columnChart.dataTable = this.organizationGraphData;

    // Set up color mapping if necessary
    if (!this.organizationGraph.columnChart.options.series) {
      const barColorSettings = {};
      const orgCount = this.orgData.length - 3;
      for (let i = 0; i < orgCount; i++) {
        let orgName: string = this.orgData[i]['orgid'];
        orgName = orgName.substring(14, orgName.length - 16);
        const orgColor: string = this.orgColors[orgName];
        if (orgColor) {
          const colorObj = {};
          colorObj['color'] = orgColor;
          barColorSettings[orgCount - i - 1] = colorObj;
        }
      }
      this.organizationGraph.columnChart.options['series'] = barColorSettings;
    }

    // Force redraw when data changes
    this.organizationGraph.columnChart = Object.assign({}, this.organizationGraph.columnChart);
    // Let the graph know all data is ready

    this.organizationGraph.chartReady = true;
    if (this.organizationGraph.columnChart.component) {
      this.organizationGraph.columnChart.component.draw();
    }
  }

  // a simple CellRenderer for negative numbers
  private negativeNumberRenderer(params) {
    if (params.value === '') {
      return params.value;
    }

    if (params.value < 0) {
      return '<span style="color: red;">' + this.formatCurrency(params) + '</span>';
    } else {
      return '<span style="color: black;">' + this.formatCurrency(params) + '</span>';
    }
  }

  // helper for currency formatting
  private formatCurrency(params) {
    const str = Math.floor(params.value)
      .toString()
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,');
    return '$ ' + str;
  }

  // A valueGetter for totaling a row
  private rowTotal(data, fy: number) {
    let total = 0;
    for (let i = 0; i < 5; i++) {
      total += parseInt(data[fy + i], 10);
    }
    return total;
  }

  // a callback for determining if a ROW is editable
  private shouldEdit(params) {
    return false;
  }

  onCommunityGridIsReady(gridApi: GridApi): void {
    this.communityGridApi = gridApi;
    // gridApi.sizeColumnsToFit();
  }

  onOrgGridIsReady(gridApi: GridApi): void {
    this.orgGridApi = gridApi;

    // gridApi.sizeColumnsToFit();
  }

  onCommunityColumnIsReady(columnApi: ColumnApi): void {
    this.commColumnApi = columnApi;
  }

  onOrgColumnIsReady(columnApi: ColumnApi): void {
    this.orgColumnApi = columnApi;
  }

  onCommunityGridCellAction(cellAction: DataGridMessage) {
    if ('Community' === this.activeTab.heading) {
      this.onCellAction(cellAction, 'community');
    }
  }

  onOrgGridCellAction(cellAction: DataGridMessage) {
    if ('Organization' === this.activeTab.heading) {
      this.onCellAction(cellAction, 'org');
    }
  }

  onCellAction(cellAction: DataGridMessage, gridType: any): void {
    switch (cellAction.message) {
      case 'save': {
        this.onSaveRow(cellAction.rowIndex, gridType);
        break;
      }
      case 'edit': {
        this.onEditRow(cellAction.rowIndex, gridType);
        break;
      }
    }
  }

  onSaveRow(rowId, gridType): void {
    const editAction = this.onSaveAction(rowId, gridType);
    if (gridType === 'org') {
      const fy = this.byYear;
      this.orgData[rowId].actions = editAction;
      this.orgGridApi.stopEditing();

      // update subtotal row
      const subtoaRow = this.calculateSubToaTotals();
      this.refreshOrgsTotalsRow(subtoaRow);

      // update delta row
      let deltaRow = {};
      deltaRow = this.calculateDeltaRow(subtoaRow, this.communityData[1]);
      this.refreshDeltaRow(deltaRow);

      this.orgGridApi.setRowData(this.orgData);
    } else {
      this.communityData[rowId].actions = editAction;
      this.communityGridApi.stopEditing();
      this.onCommunityToaChange(rowId);
    }

    this.updateCommunityGraphData(this.currentYear);
    this.updateOrganizationGraphData(this.currentYear);
  }

  onEditRow(rowId, gridType): void {
    const editAction = this.onEditAction(rowId, gridType);

    if (gridType === 'org') {
      this.orgGridApi.startEditingCell({
        rowIndex: rowId,
        colKey: this.byYear
      });
    } else {
      this.currentRowDataState.currentEditingRowData = { ...this.communityData[rowId] };
      this.currentRowDataState.currentEditingRowIndex = rowId;
      this.communityGridApi.startEditingCell({
        rowIndex: rowId,
        colKey: this.byYear
      });
    }
  }

  private cancelRow(rowIdx: number, gridType: string) {
    const editAction = this.onSaveAction(rowIdx, gridType);
    if (gridType === 'community') {
      this.communityGridApi.stopEditing();
      this.communityData[rowIdx] = this.currentRowDataState.currentEditingRowData;
      this.communityData[rowIdx].actions = editAction;
      this.communityGridApi.setRowData(this.communityData);
    }
  }

  onResetCommunityData() {
    // Restore original row values from Pom
    const communityTOARowId = 1;
    this.communityData = [];
    this.buildCommunityToaRows(this.byYear);
    this.communityGridApi.setRowData(this.communityData);

    // Notify components of change
    this.onCommunityToaChange(communityTOARowId);
    this.updateCommunityGraphData(this.currentYear);
    this.updateOrganizationGraphData(this.currentYear);
  }

  onResetOrgData() {
    // Restore original row values from Pom
    this.orgData = [];
    this.buildOrgToaRows(this.byYear);
    this.orgGridApi.setRowData(this.orgData);

    // Notify components of change
    this.updateOrganizationGraphData(this.currentYear);
  }

  onEditAction(rowId: number, gridId): any {
    let actions = new Action();

    if (gridId === 'org') {
      actions = this.orgData[rowId]['Organizationactions'];
    } else {
      actions = this.communityData[rowId]['Communityactions'];
    }

    actions.canDelete = false;
    actions.canEdit = false;
    actions.canSave = true;
    actions.canUpload = false;

    return actions;
  }

  onSaveAction(rowId: number, gridId: string): any {
    let actions = new Action();
    if (gridId === 'org') {
      actions = this.orgData[rowId]['Organizationactions'];
    } else {
      actions = this.communityData[rowId]['Communityactions'];
    }

    actions.canDelete = false;
    actions.canEdit = true;
    actions.canSave = false;
    actions.canUpload = false;

    return actions;
  }

  onCommunityToaChange(rowId: number) {
    const fy = this.byYear;
    const communityTOARow = this.communityData[rowId];
    this.orgData.forEach(row => {
      const rval = row['orgid'];
      if (rval === 'sub TOA Total Goal') {
        for (let i = 0; i < 5; i++) {
          row[fy + i] = communityTOARow[fy + i];
        }
      }
    });

    const orgtotals = this.calculateSubToaTotals();
    const deltarow = this.calculateDeltaRow(orgtotals, communityTOARow);
    this.refreshDeltaRow(deltarow);

    this.orgGridApi.setRowData(this.orgData);
  }

  calculateSubToaTotals(): any {
    const subtoarow = {};
    const fy = this.programYearSelected;

    subtoarow['orgid'] = 'sub-TOA Total Actual';
    for (let i = 0; i < 5; i++) {
      let total = 0;
      this.orgData.forEach(row => {
        if (row['Organizationactions'] !== undefined) {
          if (row[fy + i] === undefined) {
            row[fy + i] = 0;
          }
          total = total + Number(row[fy + i]);
        }
      });
      subtoarow[fy + i] = total;
    }

    // et the sub taotal row from the org data
    // this.orgData.forEach(row => {})
    return subtoarow;
  }

  refreshOrgsTotalsRow(subtoaRow: any) {
    const fy = this.byYear;
    this.orgData.forEach(row => {
      const rval = row['orgid'];
      if (rval === 'sub-TOA Total Actual') {
        for (let i = 0; i < 5; i++) {
          row[fy + i] = subtoaRow[fy + i];
        }
      }
    });
  }

  calculateDeltaRow(totalsrow: any, subtoasrow: any): any {
    const toaDeltarow = {};

    const fy = this.programYearSelected;
    toaDeltarow['orgid'] = 'Delta';
    for (let i = 0; i < 5; i++) {
      toaDeltarow[fy + i] = totalsrow[fy + i] - subtoasrow[fy + i];
    }

    return toaDeltarow;
  }

  refreshDeltaRow(deltaRow: any) {
    const fy = this.byYear;
    this.orgData.forEach(row => {
      const rval = row['orgid'];
      if (rval === 'Delta') {
        for (let i = 0; i < 5; i++) {
          row[fy + i] = deltaRow[fy + i];
        }
      }
    });
  }

  getOrgColorStyle(param): any {
    let cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal', backgroundColor: null };
    let orgName: string = param.value;

    if (orgName !== undefined) {
      orgName = orgName.replace('<strong><span>', '');
      orgName = orgName.replace('</span></strong>', '');
      if (this.orgColors[orgName] !== undefined) {
        const orgColor: string = this.orgColors[orgName];
        cellStyle = { display: 'flex', 'align-items': 'center', 'white-space': 'normal', backgroundColor: orgColor };
      }
      return cellStyle;
    }

    return undefined;
  }

  private onTabToNextCell(params) {
    const rowIndex = params.previousCellPosition.rowIndex;
    let nextCell: CellPosition = params.nextCellPosition;

    const firstColumn = this.byYear.toString();
    const lastColumn = (this.byYear + 4).toString();

    if (params.previousCellPosition.column.colId === lastColumn) {
      const nextColumn: Column = this.commColumnApi.getColumn(firstColumn);
      nextCell = {
        rowIndex,
        column: nextColumn,
        rowPinned: undefined
      };
    }
    return nextCell;
  }

  onTabSelected(tab: TabDirective) {
    this.activeTab = tab;
    switch (tab.heading) {
      case 'Community':
        if (this.communityGraph) {
          this.updateCommunityGraphData(this.currentYear);
        }
        break;
      case 'Organization':
        if (this.organizationGraph) {
          this.updateOrganizationGraphData(this.currentYear);
        }
        break;
    }
  }

  onCancelSaveConfirmationDlg() {
    this.saveConfirmationDlg.display = false;
    this.cancelRow(this.currentRowDataState.currentEditingRowIndex, 'community');
  }
}

export interface ToaRowDataStateInterface {
  currentEditingRowIndex?: number;
  isAddMode?: boolean;
  isEditMode?: boolean;
  currentEditingRowData?: TOA;
}
