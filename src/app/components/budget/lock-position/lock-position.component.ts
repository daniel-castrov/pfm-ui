import {Component, OnInit} from '@angular/core';
import {CurrentPhase} from '../../../services/current-phase.service';
import {
  AdjustmentDetail, BESService, Budget, LockPositionService, PBService, PresidentialBudget,
  SummaryDetail, Tag
} from '../../../generated';
import {forkJoin} from 'rxjs/internal/observable/forkJoin';
import {NgbDate} from '@ng-bootstrap/ng-bootstrap/datepicker/ngb-date';
import {LockPosition} from '../../../generated/model/lockPosition';
import {NgbDateParserFormatter} from '@ng-bootstrap/ng-bootstrap';
import {FormatterUtil} from '../../../utils/formatterUtil';
import {NgModel} from '@angular/forms';
import {TagsUtils, TagType} from '../../../services/tags-utils.service';

@Component({
  selector: 'lock-position',
  templateUrl: './lock-position.component.html',
  styleUrls: ['./lock-position.component.scss']
})
export class LockPositionComponent implements OnInit {

  budget: Budget;
  fy: number;
  cy: number;
  py: number;
  scenarios: any[] = [];
  programElements: string[];
  today: Date = new Date();
  cyDateSelected: NgbDate;
  pyDateSelected: NgbDate;
  isCyDateValid: boolean;
  isPyDateValid: boolean;
  scenarioSelected = null;
  programElementSelected;
  summaryColumnDefs = [];
  adjustmentsColumnDefs = [];
  adjustmentsData;
  totalAdjustmentRow;
  summaryData;
  totalSummaryRow;
  lockPosition: LockPosition;
  previousLocks: LockPosition[];
  peVisited = new Set<string>();

  constructor(private currentPhase: CurrentPhase,
              private besService: BESService,
              private pbService: PBService,
              private lockPositionService: LockPositionService,
              private dateParser: NgbDateParserFormatter,
              private tagsUtils: TagsUtils) {
  }

  async ngOnInit() {
    this.budget = await this.currentPhase.budget().toPromise();
    this.fy = this.budget.fy - 2000;
    this.cy = this.fy - 1;
    this.py = this.fy - 2;
    forkJoin([
      this.besService.getByBudget(this.budget.id),
      this.pbService.getByBudget(this.budget.id)
    ]).subscribe((data: any) => {
      data[0].result.forEach(bes => {
        this.scenarios.push(
          {
            display: 'BES/' + bes.appropriation + '/' + bes.name,
            type: 'BES',
            id: bes.id,
            appropriation: bes.appropriation === 'PROC' ? bes.appropriation : 'RDT&E'
            // TODO: I shouldn't have to do this, please change the text for RDT&E for the BES and PB collections
          });
      });

      data[1].result.forEach(pb => {
        this.scenarios.push(
          {
            display: 'PB/' + pb.appropriation + '/' + pb.name,
            type: 'PB',
            id: pb.id,
            appropriation: pb.appropriation === 'PROC' ? pb.appropriation : 'RDT&E'
          });
      });
    });
    this.defineColumns();
  }

  async initData() {
    const adjustmentsData = [];
    let executionTransactionTags: Tag[] = await this.tagsUtils.tags(TagType.EXECUTION_TRANSACTION, true, false).toPromise();
    executionTransactionTags = executionTransactionTags.filter(tag => tag.abbr !== 'NONE');
    executionTransactionTags.forEach(tag => {
      const ad: AdjustmentDetail = this.lockPosition.mapPeToDetails[this.programElementSelected].adjustments[tag.abbr];
      adjustmentsData.push({
        adjustmentTag: tag,
        pyCalculated: ad.py.calculated,
        pyAdjusted: ad.py.adjusted,
        cyCalculated: ad.cy.calculated,
        cyAdjusted: ad.cy.adjusted
      });
    });

    this.adjustmentsData = adjustmentsData;

    const summaryData = [];
    Object.keys(this.lockPosition.mapPeToDetails[this.programElementSelected].summary).forEach(pb => {
      const sd: SummaryDetail = this.lockPosition.mapPeToDetails[this.programElementSelected].summary[pb];
      summaryData.push({
        presidentBudget: pb.charAt(0) + pb.substring(1).toLowerCase(),
        py: sd.py,
        cy: sd.cy
      });
    });
    this.summaryData = summaryData;
  }

  async loadEvents() {
    if (this.scenarioSelected) {
      this.lockPositionService.getProgramElements(this.scenarioSelected.appropriation).subscribe(data => {
        this.programElements = data.result;
        this.programElements.sort();
        this.programElementSelected = this.programElements[0];
        this.peVisited.add(this.programElementSelected);

        this.cyDateSelected = null;
        this.pyDateSelected = null;
        this.lockPosition = null;

        this.lockPositionService.getEvents(this.budget.id, this.scenarioSelected.id).subscribe(response => {
          this.previousLocks = response.result;
        });
      });
    }
  }

  initTotalRows() {
    let pyCalculatedTotal = 0.00;
    let pyAdjustedTotal = 0.00;
    let cyCalculatedTotal = 0.00;
    let cyAdjustedTotal = 0.00;
    Object.keys(this.lockPosition.mapPeToDetails[this.programElementSelected].adjustments).forEach(tag => {
      const ad: AdjustmentDetail = this.lockPosition.mapPeToDetails[this.programElementSelected].adjustments[tag];
      pyCalculatedTotal += ad.py.calculated;
      pyAdjustedTotal += ad.py.adjusted;
      cyCalculatedTotal += ad.cy.calculated;
      cyAdjustedTotal += ad.cy.adjusted;
    });

    this.totalAdjustmentRow = [{
      adjustmentTag: {name: 'Total Adjustments'},
      pyCalculated: pyCalculatedTotal,
      pyAdjusted: pyAdjustedTotal,
      cyCalculated: cyCalculatedTotal,
      cyAdjusted: cyAdjustedTotal
    }];


    const previousPy = this.lockPosition.mapPeToDetails[this.programElementSelected].summary[PresidentialBudget.PREVIOUS].py;
    const currentPy = this.lockPosition.mapPeToDetails[this.programElementSelected].summary[PresidentialBudget.CURRENT].py;

    const previousCy = this.lockPosition.mapPeToDetails[this.programElementSelected].summary[PresidentialBudget.PREVIOUS].cy;
    const currentCy = this.lockPosition.mapPeToDetails[this.programElementSelected].summary[PresidentialBudget.CURRENT].cy;

    this.totalSummaryRow = [{
      presidentBudget: 'Total Adjustments',
      py: currentPy - previousPy,
      cy: currentCy - previousCy
    }];
  }

  defineColumns() {
    this.summaryColumnDefs = [
      {
        headerName: 'President\'s Budget',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        field: 'presidentBudget',
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 300,
        minWidth: 300,
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          },
          'font-weight-bold': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          }
        }
      },
      {
        headerName: 'FY(' + this.py + ')',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        field: 'py',
        cellClass: ['ag-cell-white', 'text-right'],
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params);
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          },
          'font-weight-bold': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          }
        }
      },
      {
        headerName: 'FY(' + this.cy + ')',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        field: 'cy',
        cellClass: ['ag-cell-white', 'text-right'],
        valueFormatter: params => {
          return FormatterUtil.currencyFormatter(params);
        },
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          },
          'font-weight-bold': params => {
            return params.data.presidentBudget === 'Total Adjustments';
          }
        }
      }
    ];

    this.adjustmentsColumnDefs = [
      {
        headerName: 'Adjustment Category',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        field: 'adjustmentTag',
        valueGetter: params => params.data.adjustmentTag.name,
        cellClass: ['ag-cell-light-grey'],
        maxWidth: 300,
        minWidth: 300,
        cellClassRules: {
          'ag-cell-footer-sum': params => {
            return params.data.adjustmentTag.name === 'Total Adjustments';
          },
          'font-weight-bold': params => {
            return params.data.adjustmentTag.name === 'Total Adjustments';
          }
        }
      },
      {
        headerName: 'FY(' + this.py + ')',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        children: [
          {
            headerName: 'Calculated',
            headerClass: 'no-filter-header',
            suppressMenu: true,
            field: 'pyCalculated',
            cellClass: ['ag-cell-white', 'text-right'],
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params);
            },
            cellClassRules: {
              'ag-cell-footer-sum': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              },
              'font-weight-bold': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              }
            }
          },
          {
            headerName: 'Adjusted',
            headerClass: 'no-filter-header',
            suppressMenu: true,
            field: 'pyAdjusted',
            cellClass: ['ag-cell-edit', 'text-right'],
            editable: true,
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params);
            },
            onCellValueChanged: params => this.onValueAdjusted(params),
            cellClassRules: {
              'ag-cell-footer-sum': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              },
              'font-weight-bold': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              }
            }
          }
        ]
      },
      {
        headerName: 'FY(' + this.cy + ')',
        headerClass: 'no-filter-header',
        suppressMenu: true,
        children: [
          {
            headerName: 'Calculated',
            headerClass: 'no-filter-header',
            suppressMenu: true,
            field: 'cyCalculated',
            cellClass: ['ag-cell-white', 'text-right'],
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params);
            },
            cellClassRules: {
              'ag-cell-footer-sum': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              },
              'font-weight-bold': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              }
            }
          },
          {
            headerName: 'Adjusted',
            headerClass: 'no-filter-header',
            suppressMenu: true,
            field: 'cyAdjusted',
            cellClass: ['ag-cell-edit', 'text-right'],
            editable: true,
            valueFormatter: params => {
              return FormatterUtil.currencyFormatter(params);
            },
            onCellValueChanged: params => this.onValueAdjusted(params),
            cellClassRules: {
              'ag-cell-footer-sum': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              },
              'font-weight-bold': params => {
                return params.data.adjustmentTag.name === 'Total Adjustments';
              }
            }
          }
        ]
      }
    ];
  }

  onPyDateSelection(ngModel: NgModel) {
    this.isPyDateValid = ngModel && !ngModel.invalid;
  }

  onCyDateSelection(ngModel: NgModel) {
    this.isCyDateValid = ngModel && !ngModel.invalid;
  }

  async extract() {
    const extractInformation: LockPosition = {
      scenarioId: this.scenarioSelected.id,
      scenarioType: this.scenarioSelected.type,
      asOfCy: this.dateParser.format(this.cyDateSelected),
      asOfPy: this.dateParser.format(this.pyDateSelected)
    };
    this.lockPositionService.extract(this.programElementSelected, extractInformation).subscribe(async response => {
      this.lockPosition = response.result;
      await this.initData();
      await this.initTotalRows();
    });
  }

  async onProgramElementChange() {
    this.peVisited.add(this.programElementSelected);
    this.lockPositionService.extract(this.programElementSelected, this.lockPosition).subscribe(async response => {
      this.lockPosition = response.result;
      await this.initData();
      await this.initTotalRows();
    });
  }

  lock() {
    this.lockPositionService.lock(this.lockPosition).subscribe(() => {
      this.loadEvents();
    });
  }

  onValueAdjusted(params) {
    const tag = params.data.adjustmentTag;
    if (params.column.colId === 'pyAdjusted') {
      this.lockPosition.mapPeToDetails[this.programElementSelected].adjustments[tag.abbr].py.adjusted = Number(params.newValue);
    } else {
      this.lockPosition.mapPeToDetails[this.programElementSelected].adjustments[tag.abbr].cy.adjusted = Number(params.newValue);
    }
    this.initTotalRows();
  }

  sizeColumnsToFit(params) {
    params.api.sizeColumnsToFit();
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
}
