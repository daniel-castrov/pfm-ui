import { Component, OnInit, ViewChild } from '@angular/core';
import { PomService } from '../../programming-feature/services/pom-service';
import { DialogService } from '../../pfm-coreui/services/dialog.service';
import { ListItem } from '../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { Router } from '@angular/router';
import { FormatterUtil } from '../../util/formatterUtil';
import { FileMetaData } from '../../pfm-common-models/FileMetaData';
import { Attachment } from '../../pfm-common-models/Attachment';
import { CellPosition, Column, ColumnApi, GridApi } from '@ag-grid-community/all-modules';
import { AppModel } from '../../pfm-common-models/AppModel';
import { ActionCellRendererComponent } from '../../pfm-coreui/datagrid/renderers/action-cell-renderer/action-cell-renderer.component';
import { Action } from '../../pfm-common-models/Action';
import { TOA } from '../models/TOA';
import { Pom } from '../models/Pom';
import { Organization } from '../../pfm-common-models/Organization';
import { OrganizationService } from '../../services/organization-service';
import { CreateProgrammingCommunityGraphComponent } from './create-programming-community-graph/create-programming-community-graph.component';
import { DashboardMockService } from '../../pfm-dashboard-module/services/dashboard.mock.service';
import { DataGridMessage } from '../../pfm-coreui/models/DataGridMessage';
import { CreateProgrammingOrganizationGraphComponent } from './create-programming-organization-graph/create-programming-organization-graph.component';
import { TabDirective, TabsetComponent } from 'ngx-bootstrap';
import { SecondaryButtonComponent } from '../../pfm-coreui/form-inputs/secondary-button-input/secondary-button.component';
import { NumericCellEditor } from '../../ag-grid/cell-editors/NumericCellEditor';
import { ToastService } from 'src/app/pfm-coreui/services/toast.service';

@Component({
  selector: 'pfm-programming',
  templateUrl: './create-programming.component.html',
  styleUrls: ['./create-programming.component.css']
})
export class CreateProgrammingComponent implements OnInit {
  @ViewChild(DropdownComponent)
  yearDropDown: DropdownComponent;
  @ViewChild(TabsetComponent)
  tabset: TabsetComponent;
  @ViewChild(SecondaryButtonComponent)
  resetButton: SecondaryButtonComponent;
  @ViewChild(CreateProgrammingCommunityGraphComponent)
  communityGraph: CreateProgrammingCommunityGraphComponent;
  @ViewChild(CreateProgrammingOrganizationGraphComponent)
  organizationGraph: CreateProgrammingOrganizationGraphComponent;

  id = 'create-programming-component';
  busy: boolean;
  availableYears: ListItem[];
  selectedYear: string;
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

  constructor(
    private organizationService: OrganizationService,
    private pomService: PomService,
    private dialogService: DialogService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.orgColors['PAIO'] = '#dc3912';
    this.orgColors['DUSA-TE'] = '#3366cc';
    this.orgColors['JSTO-CBD'] = '#ff9900';
    this.orgColors['JPEO-CBRND'] = '#990099';
    this.orgColors['JRO-CBRND'] = '#109618';

    this.subToasData = [];

    this.organizationService.getAll().subscribe(
      resp => {
        this.orgs = (resp as any).result;
      },
      error => {
        console.log('Error while getting Organizations...');
      });
  }

  yearSelected(year: string): void {
    this.selectedYear = year;
    this.loadBaseline = false;
    if (this.programYearSelected !== 'undefined') {
      this.dialogService
        .displayConfirmation('You are about to replace the baseline with different values.' +
          'All values in the community and organization grid will be reset.  Do you want to continue?',
          'Caution',
          () => {
            this.loadBaseline = true;
            this.onSelectBaseLine();
          }, () => {
            this.loadBaseline = false;
            this.yearDropDown.selectedItem = this.programYearSelected;
          });
    } else {
      this.loadBaseline = true;
    }

    if (this.loadBaseline) {
      this.onSelectBaseLine();
    }

  }

  onSelectBaseLine() {
    this.programYearSelected = Object.keys(this.selectedYear).map(key => this.selectedYear[key]).slice(0, 1);

    if (this.programYearSelected === 'Spreadsheet') {
      this.showUploadDialog = true;
    } else { // if it is PBYear
      this.showUploadDialog = false;
      this.programBudgetData = true;

      this.initGrids(this.byYear);
      this.getPomFromPB(this.byYear);
    }
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
    this.pomService.getPomFromPb().subscribe(
      resp => {
        this.busy = false;
        this.pom = (resp as any).result;
        this.loadGrids(selectedYear);
      },
      error => {
        this.busy = false;
        console.log('Error in getting community and org toas...');
      });
  }

  buildCommunityToaRows(fy: number) {
    const toarow = {};

    // BaseLine
    let row = {};
    row['orgid'] = '<strong><span>Baseline</span></strong>';
    this.pom.communityToas.forEach(toa => {
      row[toa.year] = toa.amount;
    });

    const actions = this.getActions();
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

      row['Organizationactions'] = this.getActions();
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

  getActions(): Action {
    const actions = new Action();
    actions.canDelete = false;
    actions.canEdit = true;
    actions.canSave = false;
    actions.canUpload = false;
    return actions;
  }

  getOrgName(orgId: string): string {
    const matchingOrg: Organization = this.orgs.find(org => org.id === orgId);
    return (matchingOrg) ? matchingOrg.abbreviation : 'Unknown Organization';
  }

  getOrgId(orgName: string): string {
    const matchingOrg: Organization = this.orgs.find(org => org.abbreviation === orgName);
    return (matchingOrg) ? matchingOrg.id : 'Unknown Organization';
  }

  handlePOMFile(newFile: FileMetaData): void {
    this.showUploadDialog = false;
    if (newFile) {
      const attachment: Attachment = new Attachment();
      attachment.file = newFile;
      this.programBudgetData = true;
      this.uploadedFileId = newFile.id;
      this.LoadPomFromFile(newFile.id);
    } else {
      this.yearDropDown.selectedItem = this.yearDropDown.prompt;
    }
  }

  onCreateProgrammingPhase(): void {
    const year: any = this.selectedYear;
  }

  LoadPomFromFile(fileId: string) {
    this.busy = true;
    this.pomService.getPomFromFile(fileId).subscribe(
      resp => {
        this.busy = false;
        this.pom = (resp as any).result;
        this.initGrids(this.byYear);
        this.loadGrids(this.byYear);
      },
      error => {
        this.busy = false;
        console.log(error);
      }
    );
  }

  ngOnInit() {
    this.byYear = FormatterUtil.getCurrentFiscalYear() + 2;
    const pbYear: any = FormatterUtil.getCurrentFiscalYear() + 1;

    this.programYearSelected = 'undefined';
    this.busy = true;
    this.pomService.pBYearExists(pbYear).subscribe(
      resp => {
        const response: any = resp;

        this.busy = false;
        const pyear = 'PB' + FormatterUtil.pad((pbYear - 2000), 2);
        const years: string[] = [pyear, 'Spreadsheet'];
        this.availableYears = this.toListItem(years);

      },
      error => {
        const response: any = error;
        this.busy = false;
        const years: string[] = ['Spreadsheet'];
        this.availableYears = this.toListItem(years);
        console.log(response.error);
      });
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
    colDefs.push(
      {
        headerName: column1Name,
        suppressMenu: true,
        field: 'orgid',
        minWidth: 140,
        editable: false,
        pinned: 'left',
        // rowDrag: true,
        // rowDragManaged: true,
        colSpan(params) {
          return (params.value === '1') ? 7 : 1;
        },
        cellRenderer: params => params.value,
        cellClass: 'text-class',
        cellStyle: params => this.getOrgColorStyle(params),

      });

    for (let i = 0; i < 5; i++) {
      colDefs.push(
        {
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
    colDefs.push(
      {
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

    colDefs.push(
      {
        headerName: 'Actions',
        field: column1Name + 'actions',
        mWidth: 100,
        maxWidth: 100,
        cellRendererFramework: ActionCellRendererComponent
      }
    );

    return colDefs;
  }

  // updates the community graph from grid data
  private updateCommunityGraphData(startYear: number) {
    // populate griddata
    this.communityGraphData = [['Fiscal Year', 'Community TOA', 'Average',]];
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
        change = ((amount - pastAmount) / pastAmount);
      }
      this.communityGraphData[row + 1] = [year, amount, change];
    }

    this.communityGraph.columnChart.dataTable = this.communityGraphData;
    this.communityGraph.columnChart = Object.assign({}, this.communityGraph.columnChart);
    this.communityGraph.chartReady = true;
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
          this.organizationGraphData[rowIndex + 1][column] =
            parseInt(this.orgData[numberOfColumns - column - 1][startYear + rowIndex], 10);
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
      this.communityGridApi.startEditingCell({
        rowIndex: rowId,
        colKey: this.byYear
      });
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

    // Deselect button
    this.resetButton.blur();
  }

  onResetOrgData() {
    // Restore original row values from Pom
    this.orgData = [];
    this.buildOrgToaRows(this.byYear);
    this.orgGridApi.setRowData(this.orgData);

    // Notify components of change
    this.updateOrganizationGraphData(this.currentYear);

    // Deselect button
    this.resetButton.blur();
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
    // toarow['orgid'] = "sub TOA Total Goal"
  }

  calculateSubToaTotals(): any {
    const subtoarow = {};
    const fy = this.byYear;

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

    const fy = this.byYear;
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

    const firstColumn = (this.byYear).toString();
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
          this.updateCommunityGraphData(this.byYear);
        }
        break;
      case 'Organization':
        if (this.organizationGraph) {
          this.updateOrganizationGraphData(this.byYear);
        }
        break;
    }
  }

  onCreateProgramPhase() {
    const isOrgDataValid = true;
    let isDelataRowValid = true;

    for (const row of this.orgData) {
      for (let i = 0; i < 5; i++) {
        const cellVal = row[this.byYear + i];
        /*if ( (cellVal <= 0) && (row["orgid"] != "Delta")){
            isOrgDataValid = false;
            break;
        }*/

        if ((cellVal < 0) && (row['orgid'] === 'Delta')) {
          isDelataRowValid = false;
          break;
        }
      }

      if (!isOrgDataValid || !isDelataRowValid) {
        break;
      }
    }

    if (!isDelataRowValid) {
      this.dialogService.displayInfo(
        'The Delta row in the Organization TOA grid has at least one negative value.' +
        'All values must be zero or positive');
      return;
    }

    this.createPom();
  }

  createPom() {
    const communityToas: TOA[] = [];
    const commToaRow = this.communityData[1];
    for (let i = 0; i < 5; i++) {
      communityToas.push({ year: (this.byYear + i), amount: commToaRow[this.byYear + i] });
    }

    const orgToas: { [key: string]: TOA[]; } = {};
    for (let rowIndx = 0; rowIndx < (this.orgData.length - 3); rowIndx++) {
      const otoa: TOA[] = [];
      const orgRow = this.orgData[rowIndx];
      for (let i = 0; i < 5; i++) {
        otoa.push({ year: (this.byYear + i), amount: orgRow[this.byYear + i] });
      }

      let orgName = orgRow['orgid'];
      orgName = orgName.replace('<strong><span>', '');
      orgName = orgName.replace('</span></strong>', '');
      orgToas[this.getOrgId(orgName)] = otoa;
    }

    this.pom.communityToas = communityToas;
    this.pom.orgToas = orgToas;

    this.pomService.createPom(this.byYear, this.pom).subscribe(
      resp => {
        // Update POM from server
        this.pom = (resp as any).result;
        this.toastService.displaySuccess(`Programming phase for ${this.byYear} successfully created.`);
        this.router.navigate(['/home']);
      },
      error => {
        this.dialogService.displayInfo(error.error.error);
      });
  }
}
