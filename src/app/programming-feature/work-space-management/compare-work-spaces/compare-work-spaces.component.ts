import { Component, OnInit, ViewChild } from '@angular/core';
import { DialogService } from 'src/app/pfm-coreui/services/dialog.service';
import { AppModel } from 'src/app/pfm-common-models/AppModel';
import { WorkspaceService } from '../../services/workspace.service';
import { PomService } from '../../services/pom-service';
import { Pom } from '../../models/Pom';
import { GoogleChartComponent, GoogleChartInterface } from 'ng2-google-charts';
import { ListItem } from '../../../pfm-common-models/ListItem';
import { DropdownComponent } from '../../../pfm-coreui/form-inputs/dropdown/dropdown.component';
import { FundingLine } from '../../models/funding-line.model';
import { SAG } from '../../models/sag.model';
import { PropertyService } from '../../services/property.service';
import { FundingLineService } from '../../services/funding-line.service';
import { Workspace } from '../../models/workspace';
import { Router } from '@angular/router';

@Component({
  selector: 'pfm-compare-work-spaces',
  templateUrl: './compare-work-spaces.component.html',
  styleUrls: ['./compare-work-spaces.component.scss']
})
export class CompareWorkSpacesComponent implements OnInit {
  @ViewChild('googleChart')
  chart: GoogleChartComponent;
  @ViewChild('displayDropdown')
  displayDropdown: DropdownComponent;
  @ViewChild('appropriationDropdown')
  appropriationDropdown: DropdownComponent;
  @ViewChild('bablinDropdown')
  bablinDropdown: DropdownComponent;
  @ViewChild('sagDropdown')
  sagDropdown: DropdownComponent;
  @ViewChild('wucdDropdown')
  wucdDropdown: DropdownComponent;
  @ViewChild('expTypeDropdown')
  expTypeDropdown: DropdownComponent;
  pomYear: number;

  chartData: GoogleChartInterface = {
    chartType: 'LineChart',
    options: {
      title: 'Funding by Workspace',
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

  displayDropdownOptions: ListItem[] = [];
  appropriationDropdownOptions: ListItem[] = [];
  bablinDropdownOptions: ListItem[] = [];
  sagDropdownOptions: ListItem[] = [];
  wucdDropdownOptions: ListItem[] = [];
  expTypeDropdownOptions: ListItem[] = [];

  workspaces: Workspace[] = [];
  private pom: Pom;

  fundingLinesByWrksp: { [key: string]: FundingLine[] } = {};

  constructor(
    private dialogService: DialogService,
    private appModel: AppModel,
    private workspaceService: WorkspaceService,
    private pomService: PomService,
    private propertyService: PropertyService,
    private fundingLineService: FundingLineService,
    private router: Router
  ) {}

  ngOnInit() {
    this.busy = true;
    this.pomService.getOpenPom().subscribe(
      resp => {
        this.pom = (resp as any).result;
        if (this.pom != null) {
          this.pomYear = this.pom.fy;
          this.loadWorkspaces();
        } else {
          this.busy = false;
        }
      },
      error => {
        this.dialogService.displayDebug(error);
      }
    );
    this.loadDropDownValues();
  }

  onBack() {
    this.router.navigate(['/programming/work-space-management']);
  }

  private loadWorkspaces() {
    if (this.pom) {
      this.workspaceService.getByContainerId(this.pom.id).subscribe(
        resp => {
          this.workspaces = (resp as any).result;
          this.loadFundingLines();
        },
        error => {
          this.dialogService.displayError(error.error.error);
        }
      );
    }
  }

  private loadFundingLines() {
    const containerIds = this.workspaces.map(x => x.id);
    this.fundingLineService.getByProgramContainerIds(containerIds).subscribe(
      resp => {
        this.fundingLinesByWrksp = (resp as any).result;
        this.drawLineChart();
      },
      error => {
        this.dialogService.displayError(error.error.error);
      },
      () => {
        this.busy = false;
      }
    );
  }

  private loadDropDownValues() {
    this.displayDropdownOptions = [
      {
        id: 'PR',
        name: 'PR',
        value: 'PR',
        rawData: 'PR',
        isSelected: true
      },
      {
        id: 'APPN',
        name: 'APPN',
        value: 'APPN',
        rawData: 'APPN',
        isSelected: false
      },
      {
        id: 'BA/BLIN',
        name: 'BA/BLIN',
        value: 'BA/BLIN',
        rawData: 'BA/BLIN',
        isSelected: false
      },
      {
        id: 'SAG',
        name: 'SAG',
        value: 'SAG',
        rawData: 'SAG',
        isSelected: false
      },
      {
        id: 'WUCD',
        name: 'WUCD',
        value: 'WUCD',
        rawData: 'WUCD',
        isSelected: false
      },
      {
        id: 'EXP Type',
        name: 'EXP Type',
        value: 'EXP Type',
        rawData: 'EXP Type',
        isSelected: false
      }
    ];
    this.insertDefaultOptions(this.appropriationDropdownOptions);
    this.insertDefaultOptions(this.bablinDropdownOptions);
    this.insertDefaultOptions(this.sagDropdownOptions);
    this.insertDefaultOptions(this.wucdDropdownOptions);
    this.insertDefaultOptions(this.expTypeDropdownOptions);
  }

  drawLineChart() {
    const data = this.lineChartData();
    this.chartData.dataTable = data;
    if (this.chart && this.chart.wrapper) {
      this.chart.draw();
    }
  }

  lineChartData() {
    let data: any[] = [['Fiscal Year']];
    let hasData: boolean;

    if (this.expTypeDropdown.visible) {
      if (this.expTypeDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.expTypeDropdown, this.expTypeDropdownOptions, 'expenditureType');
        hasData = true;
      }
    }
    if (this.wucdDropdown.visible && !hasData) {
      if (this.wucdDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.wucdDropdown, this.wucdDropdownOptions, 'wucd');
        hasData = true;
      }
    }
    if (this.sagDropdown.visible && !hasData) {
      if (this.sagDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.sagDropdown, this.sagDropdownOptions, 'sag');
        hasData = true;
      }
    }
    if (this.bablinDropdown.visible && !hasData) {
      if (this.bablinDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(this.bablinDropdown, this.bablinDropdownOptions, 'baOrBlin');
        hasData = true;
      }
    }
    if (this.appropriationDropdown.visible && !hasData) {
      if (this.appropriationDropdown.selectedItem.toLowerCase() !== 'select') {
        data = this.retrieveLineChartData(
          this.appropriationDropdown,
          this.appropriationDropdownOptions,
          'appropriation'
        );
        hasData = true;
      }
    }

    if (!hasData) {
      data = [['Fiscal Year']];
      const funds: { [key: string]: number[] } = {};
      for (const workspace of this.workspaces) {
        funds[workspace.id] = [];
        data[0].push(workspace.name);
        this.fundingLinesByWrksp[workspace.id].forEach(fundingLine => {
          for (const year of Object.keys(fundingLine.funds)) {
            funds[workspace.id][year] = funds[workspace.id][year] ?? 0;
            funds[workspace.id][year] += Number(fundingLine.funds[year]) ?? 0;
          }
        });
      }

      for (let i = this.pomYear, x = 0; i < this.pomYear + 5; i++) {
        const items: any[] = [`${i}`];
        for (const workspace of this.workspaces) {
          items.push(funds[workspace.id][i] ?? 0);
        }
        data.push(items);
      }
    }

    return data;
  }

  private retrieveLineChartData(dropdown: DropdownComponent, downpdownOptions: ListItem[], field: string) {
    const data: any[] = [['Fiscal Year']];
    let fundingLineRows = [];
    if (dropdown.selectedItem.toLowerCase() === 'all') {
      const current = [];
      for (const workspace of this.workspaces) {
        current[workspace.id] = [];
        downpdownOptions
          .filter((option, index) => index > 0)
          .forEach(option => {
            const funds: number[] = [];
            const legends = this.retrieveChartLegend();
            data[0].push(workspace.name + ', ' + (legends.length ? legends + '/' : '') + option.name);
            fundingLineRows = this.fundingLinesByWrksp[workspace.id];
            const fundingLineFiltered = this.filterFundingLineRow(fundingLineRows);
            if (!this.isSingleChartDropdown()) {
              fundingLineRows = fundingLineFiltered;
            }
            fundingLineRows
              .filter(fundingLine => fundingLine[field] === option.name)
              .forEach(row => {
                const fundingLine = row;
                for (const year of Object.keys(fundingLine.funds)) {
                  funds[year] = funds[year] ?? 0;
                  funds[year] += Number(fundingLine.funds[year]) ?? 0;
                }
              });
            current[workspace.id][option.name] = funds;
          });
      }
      for (let i = this.pomYear, x = 0; i < this.pomYear + 5; i++) {
        const singleData = [`${i}`];
        for (const workspace of this.workspaces) {
          Object.keys(current[workspace.id]).forEach(line => {
            singleData.push(current[workspace.id][line][i] ?? 0);
          });
        }
        data.push(singleData);
      }
    } else {
      const funds: { [key: string]: number[] } = {};
      for (const workspace of this.workspaces) {
        funds[workspace.id] = [];
        data[0].push(workspace.name + ', ' + this.retrieveChartLegend());

        const fundingLineFiltered = this.filterFundingLineRow(this.fundingLinesByWrksp[workspace.id]);
        fundingLineFiltered.forEach(fundingLine => {
          for (const year of Object.keys(fundingLine.funds)) {
            funds[workspace.id][year] = funds[workspace.id][year] ?? 0;
            funds[workspace.id][year] += Number(fundingLine.funds[year]) ?? 0;
          }
        });
      }
      for (let i = this.pomYear; i < this.pomYear + 5; i++) {
        const items: any[] = [`${i}`];
        for (const workspace of this.workspaces) {
          items.push(funds[workspace.id][i] ?? 0);
        }
        data.push(items);
      }
    }
    return data;
  }

  private filterFundingLineRow(fundingLineRows: any[]) {
    let filteredFundingLineRows = [];
    const dropdowns: any[] = [
      [this.appropriationDropdown, 'appropriation'],
      [this.bablinDropdown, 'baOrBlin'],
      [this.sagDropdown, 'sag'],
      [this.wucdDropdown, 'wucd'],
      [this.expTypeDropdown, 'expenditureType']
    ];

    dropdowns.forEach(dropdownData => {
      const dropdown = dropdownData[0];
      const field = dropdownData[1];
      if (dropdown.visible) {
        const selection = dropdown.selectedItem.toLowerCase();
        if (selection !== 'select' && selection !== 'all') {
          filteredFundingLineRows = filteredFundingLineRows.length
            ? filteredFundingLineRows.filter(fundingLine => fundingLine[field] === dropdown.selectedItem)
            : fundingLineRows.filter(fundingLine => fundingLine[field] === dropdown.selectedItem);
        }
      }
    });
    return filteredFundingLineRows;
  }

  private isSingleChartDropdown() {
    const dropdowns = [
      this.appropriationDropdown,
      this.bablinDropdown,
      this.sagDropdown,
      this.wucdDropdown,
      this.expTypeDropdown
    ];
    return dropdowns.filter(dropdown => dropdown.visible).length === 1;
  }

  private retrieveChartLegend() {
    const dropdowns = [
      this.appropriationDropdown,
      this.bablinDropdown,
      this.sagDropdown,
      this.wucdDropdown,
      this.expTypeDropdown
    ];
    const legends = [];
    let legend: string;
    dropdowns.forEach(dropdown => {
      legend = this.retrieveDropdownValue(dropdown);
      if (legend) {
        legends.push(legend);
      }
    });
    return legends.join('/');
  }

  private retrieveDropdownValue(dropdown: DropdownComponent) {
    if (
      dropdown.visible &&
      dropdown.selectedItem.toLowerCase() !== 'select' &&
      dropdown.selectedItem.toLowerCase() !== 'all'
    ) {
      return dropdown.selectedItem;
    }
    return null;
  }

  onDisplayDropdownChange(event: ListItem) {
    this.clearOptions(this.appropriationDropdownOptions, this.appropriationDropdown);
    this.clearOptions(this.bablinDropdownOptions, this.bablinDropdown);
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
    switch (event.name.toUpperCase()) {
      case 'APPN':
        this.loadChartDropdown(this.appropriationDropdownOptions, 'appropriation');
        break;
      case 'BA/BLIN':
        this.loadChartDropdown(this.bablinDropdownOptions, 'baOrBlin');
        break;
      case 'SAG':
        this.loadChartDropdown(this.sagDropdownOptions, 'sag');
        break;
      case 'WUCD':
        this.loadChartDropdown(this.wucdDropdownOptions, 'wucd');
        break;
      case 'EXP TYPE':
        this.loadChartDropdown(this.expTypeDropdownOptions, 'expenditureType');
        break;
    }
  }

  onAppropiationDropdownChange(event: ListItem) {
    this.clearOptions(this.bablinDropdownOptions, this.bablinDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.bablinDropdownOptions, 'baOrBlin', 'appropriation', event.name);
      this.bablinDropdown.visible = true;
    }
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onBablinDropdownChange(event: ListItem) {
    this.clearOptions(this.sagDropdownOptions, this.sagDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.sagDropdownOptions, 'sag', 'baOrBlin', event.name);
      if (this.sagDropdownOptions.length > 2) {
        this.sagDropdown.visible = true;
      }
    }
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onSagDropdownChange(event: ListItem) {
    this.clearOptions(this.wucdDropdownOptions, this.wucdDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.wucdDropdownOptions, 'wucd', 'sag', event.name);
      if (this.wucdDropdownOptions.length > 2) {
        this.wucdDropdown.visible = true;
      }
    }
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
  }

  onWucdDropdownChange(event: ListItem) {
    this.clearOptions(this.expTypeDropdownOptions, this.expTypeDropdown);
    if (event.name.toLowerCase() !== 'all' && event.name.toLowerCase() !== 'select') {
      this.loadChartDropdown(this.expTypeDropdownOptions, 'expenditureType', 'wucd', event.name);
      if (this.expTypeDropdownOptions.length > 2) {
        this.expTypeDropdown.visible = true;
      }
    }
  }

  private loadChartDropdown(options: ListItem[], field: string, originField?: string, selectedOrigin?: string) {
    options.splice(0, options.length);
    this.insertDefaultOptions(options);
    const noFilter =
      (this.displayDropdown.selectedItem.toUpperCase() === 'APPN' && field === 'appropriation') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'BA/BLIN' && field === 'baOrBlin') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'SAG' && field === 'sag') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'WUCD' && field === 'wucd') ||
      (this.displayDropdown.selectedItem.toUpperCase() === 'EXP TYPE' && field === 'expenditureType');
    const allRows = Object.keys(this.fundingLinesByWrksp).flatMap(x => this.fundingLinesByWrksp[x]);
    const filteredFundingRows = noFilter ? allRows : this.filterFundingLineRow(allRows);
    const dropdownOptions = [];
    if (filteredFundingRows.length) {
      dropdownOptions.push(
        ...filteredFundingRows.filter(fundingLine => fundingLine[field]).map(fundingLine => fundingLine[field])
      );
    } else {
      dropdownOptions.push(
        ...allRows
          .filter(fundingLine => (originField ? fundingLine[originField] === selectedOrigin : true))
          .filter(fundingLine => fundingLine[field])
          .map(fundingLine => fundingLine[field])
      );
    }
    new Set(dropdownOptions).forEach(option => {
      options.push({
        id: option,
        name: option,
        rawData: option,
        value: option,
        isSelected: false
      });
    });
  }

  private insertDefaultOptions(options: ListItem[], setSelected?: boolean) {
    options.push({
      id: 'All',
      name: 'All',
      rawData: 'All',
      value: 'All',
      isSelected: false
    });
  }

  private clearOptions(options: ListItem[], dropdown: DropdownComponent) {
    dropdown.selectedItem = 'Select';
    options.splice(0, options.length);
  }
}
