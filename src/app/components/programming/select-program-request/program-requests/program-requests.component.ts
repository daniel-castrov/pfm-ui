import {Router} from '@angular/router';
import {Component, EventEmitter, Input, OnChanges, Output, ViewChild} from '@angular/core';
import {ProgramRequestPageModeService} from '../../program-request/page-mode.service';
import {AgGridNg2} from "ag-grid-angular";
import {SummaryProgramCellRenderer} from "../../../renderers/event-column/summary-program-cell-renderer.component";
import {PhaseType, UiProgramRequest} from "../UiProgramRequest";
import {Program, ProgramService, ProgramType} from "../../../../generated";
import {NameUtils} from "../../../../utils/NameUtils";
import {CurrentPhase} from "../../../../services/current-phase.service";
import { FundingRateRenderer } from '../../../renderers/funding-rate-renderer/funding-rate-renderer.component';

@Component({
  selector: 'program-requests',
  templateUrl: './program-requests.component.html',
  styleUrls: ['./program-requests.component.scss']
})
export class ProgramsComponent implements OnChanges {

  @Input() private pomPrograms: Program[];
  @Input() private pbPrograms: Program[];
  @Input() private pomFy: number;
  @Input() private orgMap: Map<string, string>;
  @Input() private reviewOnly: boolean;
  @Output() deleted: EventEmitter<any> = new EventEmitter();

  private pbFy: number;

  // used only during PR deletion
  private idToDelete: string;
  public nameToDelete: string;
  private menuTabs = ['filterMenuTab'];
  autoGroupColumnDef = {
    headerName: "Program",
    resizable: true,
    cellStyle: { backgroundColor: "#eae9e9" },
    menuTabs: this.menuTabs,
    filter: 'agTextColumnFilter',
    cellRendererParams: { suppressCount: true, innerRenderer: 'summaryProgramCellRenderer' }
  };

  @ViewChild("agGrid") private agGrid: AgGridNg2;
  rowData = [];
  context: any;
  columnDefs = [];
  groupDefaultExpanded = -1;

  frameworkComponents = {
    summaryProgramCellRenderer: SummaryProgramCellRenderer,
    fundingRateRenderer: FundingRateRenderer,
  };

  constructor( private programService: ProgramService,
               private router: Router,
               private programRequestPageMode: ProgramRequestPageModeService ) {
    this.context = { componentParent: this };
  }

  ngOnChanges() {
    if (this.pomPrograms && this.pbPrograms && this.pomFy) {
      this.pbFy = this.pomFy - 1;
      let rowData = []
      this.pomPrograms.forEach(prOne => {
        let program = new UiProgramRequest(prOne);
        program.phaseType = PhaseType.POM;
        if (prOne.type === ProgramType.GENERIC) {
          let prTwo = this.pomPrograms.filter((prTwo: Program) => NameUtils.getParentName(prOne.shortName) === prTwo.shortName)[0];

          if (prTwo.type === ProgramType.GENERIC) {
            let prThree = this.pomPrograms.filter((prThree: Program) => NameUtils.getParentName(prTwo.shortName) === prThree.shortName)[0];

            if (prThree.type === ProgramType.GENERIC) {
              let prFour = this.pomPrograms.filter((prFour: Program) => NameUtils.getParentName(prThree.shortName) === prFour.shortName)[0];
              program.dataPath = [prFour.shortName, NameUtils.getChildName(prThree.shortName), NameUtils.getChildName(prTwo.shortName), NameUtils.getChildName(prOne.shortName)];
            } else {
              program.dataPath = [prThree.shortName, NameUtils.getChildName(prTwo.shortName), NameUtils.getChildName(prOne.shortName)];
            }
          } else {
            program.dataPath = [prTwo.shortName, NameUtils.getChildName(prOne.shortName)];
          }
        } else {
          program.dataPath = [prOne.shortName];
        }
        this.pbPrograms.forEach(pr => {
          if(pr.shortName===program.shortName) {
            program.totalFundsPB = {}
            for(var prop in program.fundingLines[0].funds) {
              program.totalFundsPB[prop] = this.getToa(pr, prop)
            }
          }
        });
        rowData.push(program);
      });
      /* this.pbPrograms.forEach(pr => {
        let programRequest = new UiProgramRequest(pr);
        programRequest.phaseType = PhaseType.PB;
        programRequest.dataPath = [pr.shortName, ''];
        if (pr.type !== ProgramType.GENERIC) {
          rowData.push(programRequest);
        }
      }); */
      this.sortObjects(rowData, ['shortName', 'phaseType']);
      this.rowData = rowData;
      this.defineColumns();
    }
    setTimeout(() => {
      this.agGrid.api.sizeColumnsToFit()
    });
  }

  getDataPath(data) {
    return data.dataPath;
  }

  onGridReady(params) {
    params.api.sizeColumnsToFit();
    window.addEventListener("resize", function () {
      setTimeout(() => {
        params.api.sizeColumnsToFit();
      });
    });
  }

  toggleExpand() {
    if (this.groupDefaultExpanded == -1) {
      this.groupDefaultExpanded = 0;
      this.agGrid.api.collapseAll();
    } else {
      this.groupDefaultExpanded = -1;
      this.agGrid.api.expandAll();
    }
    this.agGrid.api.onGroupExpandedOrCollapsed();
  }

  defineColumns() {
    this.columnDefs = [
      {
        headerName: 'Funds in $K',
        cellClass: ['text-center'],
        children: [
          {
            headerName: 'Status',
            menuTabs: this.menuTabs,
            resizable: true,
            filter: 'agTextColumnFilter',
            suppressSorting: true, 
            valueGetter: params => this.getStatus(params),
            cellClass: params => this.getStatusClass(params),
            cellStyle: { backgroundColor: "#eae9e9" },
            cellRenderer: 'summaryProgramCellRenderer',
            minWidth: 115
          },
          {
            headerName: 'Cycle',
            //menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
            minWidth: 86,
            resizable: true,
            suppressSorting: true,
            cellClass: ['ag-cell-white'],
            valueGetter: params => {
              if (params.data.phaseType == PhaseType.PB) {
                return params.data.phaseType + (this.pbFy - 2000);
              } else {
                return params.data.phaseType + (this.pomFy - 2000);
              }
            }
          },
          {
            headerName: 'Organization',
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
            width: 100,
            
            suppressSorting: true,
            cellClass: ['ag-cell-white'],
            hide: true,
            valueGetter: params => ( this.orgMap ? this.orgMap.get(params.data.organizationId): '...' ),
            field: 'organizationId'
          },
        ]
      }
    ];

    let columnKeys =  [
      this.pomFy - 3,
      this.pomFy -2,
      this.pomFy - 1,
      this.pomFy,
      this.pomFy + 1,
      this.pomFy + 2,
      this.pomFy + 3,
      this.pomFy + 4];

    columnKeys = Array.from(new Set(columnKeys));
    Array.from(columnKeys).forEach((year, index) => {
      let subHeader;
      let cellClass = [];
      switch (Number(year)) {
        case (this.pomFy + 4):
          subHeader = 'BY+4';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 3:
          subHeader = 'BY+3';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 2:
          subHeader = 'BY+2';
          cellClass = ['text-right'];
          break;
        case this.pomFy + 1:
          subHeader = 'BY+1';
          cellClass = ['text-right'];
          break;
        case this.pomFy:
          subHeader = 'BY';
          cellClass = ['text-right'];
          break;
        case this.pomFy - 1:
          subHeader = 'CY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pomFy - 2:
          subHeader = 'PY';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
        case this.pomFy - 3:
          subHeader = 'PY-1';
          cellClass = ['ag-cell-white', 'text-right'];
          break;
      }
      if (subHeader) {
        let columnKey = year.toString().replace('20', 'FY')
        let renderer = cellClass.indexOf('ag-cell-white')==-1 ? 'fundingRateRenderer' : undefined
        let colDef = {
          defaultColDef: {
            resizable: true
           },
          headerName: subHeader,
          type: "numericColumn",
          children: [{
            headerName: columnKey,
            cellRenderer: renderer,
            cellRendererParams: {
              year: year.toString(),
              fy: this.pomFy.toString(),
              innerRenderer: renderer
            },
            menuTabs: this.menuTabs,
            filter: 'agTextColumnFilter',
            minWidth: 102,
            resizable: true,
            cellClass: cellClass,
            cellClassRules: {
              'by': params => { return year >= this.pomFy && params.data.phaseType === PhaseType.POM }
            },
            type: "numericColumn",
            valueGetter: params => { return this.getToa(params.data, year) },
            valueFormatter: params => { return this.currencyFormatter(params) }
          }]
        };
        this.columnDefs.push(colDef);
      } else {
        columnKeys.splice(index, 1)
      }
    });

    let totalColDef = {
      headerName: 'FYDP Total',
      defaultColDef: {
        resizable: true
       },
      headerTooltip: 'Future Years Defense Program Total',
      menuTabs: this.menuTabs,
      filter: "agNumberColumnFilter",
      minWidth: 102,
      resizable: true,
      type: "numericColumn",
      valueGetter: params => { return this.getTotal(params.data, columnKeys) },
      valueFormatter: params => { return this.currencyFormatter(params) }
    };
    this.columnDefs.push(totalColDef);
    this.agGrid.api.setColumnDefs(this.columnDefs);
  }

  getTotal(pr, columnKeys): number {
    let result = 0;
    columnKeys.forEach(year => {
      if (year >= this.pomFy) {
        let amount = pr.fundingLines
          .map(fundingLine => fundingLine.funds[year] ? fundingLine.funds[year] : 0)
          .reduce((a, b) => a + b, 0);
        result += amount;
      }
    });
    return result;
  }

  getToa(pr, year): number {
    let amount = pr.fundingLines
      .map(fundingLine => fundingLine.funds[year] ? fundingLine.funds[year] : 0)
      .reduce((a, b) => a + b, 0);
    return amount;
  }

  saveDeletionValues(id: string, shortName: string) {
    this.idToDelete = id;
    this.nameToDelete = shortName;
  }

  delete() {
    this.programService.remove(this.idToDelete).toPromise();
    this.deleted.emit();
  }

  editPR(prId: string) {
    this.programRequestPageMode.prId = prId;
    this.router.navigate(['/program-request']);
  }

  getStatus(params) {
    if ( params.data && params.data.phaseType == PhaseType.POM) {
      return params.data.state;
    } else {
      return '';
    }
  }

  getStatusClass(params) {
    if (params.data && params.data.state === 'OUTSTANDING') {
      return 'text-danger';
    }
    return 'text-primary';
  }

  currencyFormatter(value) {
    if (isNaN(value.value)) {
      value.value = 0;
    }
    var usdFormate = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    });
    return usdFormate.format(value.value);
  }

  onPageSizeChanged(event) {
    var selectedValue = Number(event.target.value);
    this.agGrid.api.paginationSetPageSize(selectedValue);
    this.agGrid.api.sizeColumnsToFit();
  }

  sortObjects(objArray, properties) {
    var primers = arguments[2] || {};

    properties = properties.map(function (prop) {
      if (!(prop instanceof Array)) {
        prop = [prop, 'asc']
      }
      if (prop[1].toLowerCase() == 'desc') {
        prop[1] = -1;
      } else {
        prop[1] = 1;
      }
      return prop;
    });

    function valueCmp(x, y) {
      return x > y ? 1 : x < y ? -1 : 0;
    }

    function arrayCmp(a, b) {
      var arr1 = [], arr2 = [];
      properties.forEach(function (prop) {
        var aValue = a[prop[0]],
          bValue = b[prop[0]];
        if (typeof primers[prop[0]] != 'undefined') {
          aValue = primers[prop[0]](aValue);
          bValue = primers[prop[0]](bValue);
        }
        arr1.push(prop[1] * valueCmp(aValue, bValue));
        arr2.push(prop[1] * valueCmp(bValue, aValue));
      });
      return arr1 < arr2 ? -1 : 1;
    }

    objArray.sort(function (a, b) {
      return arrayCmp(a, b);
    });
  }
}
