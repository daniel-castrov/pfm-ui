import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { UFR } from 'src/app/programming-feature/models/ufr.model';
import { GoogleChartComponent, GoogleChartInterface } from 'ng2-google-charts';
import { FundingData } from '../../../models/funding-data.model';
import { FundingLine } from '../../../models/funding-line.model';
import { catchError, map, switchMap } from 'rxjs/operators';
import { Pom } from '../../../models/Pom';
import { PomStatus } from '../../../models/enumerations/pom-status.model';
import { Workspace } from '../../../models/workspace';
import { of, throwError } from 'rxjs';
import { Program } from '../../../models/Program';
import { PomService } from '../../../services/pom-service';
import { WorkspaceService } from '../../../services/workspace.service';
import { ProgrammingService } from '../../../services/programming-service';
import { FundingLineService } from '../../../services/funding-line.service';
import { ShortyType } from '../../../models/enumerations/shorty-type.model';
import { FundingLineType } from 'src/app/programming-feature/models/enumerations/funding-line-type.model';
import { UFRStatus } from '../../../models/enumerations/ufr-status.model';

@Component({
  selector: 'pfm-ufr-justification',
  templateUrl: './ufr-justification.component.html',
  styleUrls: ['./ufr-justification.component.scss']
})
export class UfrJustificationComponent implements OnInit {
  @ViewChild('googleChart')
  chart: GoogleChartComponent;

  @Input() ufr: UFR;
  @Input() pomYear: number;

  form: FormGroup;
  editMode: boolean;

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

  currentFundingLineRows: FundingData[] = [];
  proposedFundingLineRows: FundingData[] = [];
  totalRevisedFundingLineRows: FundingData[] = [];

  constructor(
    private pomService: PomService,
    private workspaceService: WorkspaceService,
    private programmingService: ProgrammingService,
    private fundingLineService: FundingLineService
  ) {}

  ngOnInit(): void {
    this.loadForm();
    this.editMode = history.state.editMode;
    this.changeEditMode(this.editMode);
  }

  loadForm() {
    this.form = new FormGroup({
      justification: new FormControl(this.ufr.justification ?? '', Validators.required),
      impactN: new FormControl(this.ufr.impactN ?? '', Validators.required),
      milestoneImpact: new FormControl(this.ufr.milestoneImpact ?? '', Validators.required)
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
                return workspace.id;
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
            .findByShortNameAndContainerId(this.ufr.shortName, containerId)
            .pipe(map(resp => resp.result as Program));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .pipe(
        switchMap(program => {
          return this.fundingLineService
            .obtainFundingLinesByContainerId(program.id, FundingLineType.PROGRAM)
            .pipe(map(fundingLines => this.convertFundsToFiscalYear(fundingLines, false)));
        }),
        catchError(error => {
          return throwError(error);
        })
      )
      .subscribe(resp => {
        const fundingLines = resp as FundingData[];
        this.currentFundingLineRows = fundingLines;
        this.loadDataFromUfr();
      });
  }

  private loadDataFromUfr() {
    this.fundingLineService
      .obtainFundingLinesByContainerId(this.ufr.id, FundingLineType.UFR_PROPOSED)
      .subscribe(resp => {
        const proposedFundingLine = resp.result as FundingLine[];
        this.proposedFundingLineRows = [];
        proposedFundingLine?.forEach(fundingLine => {
          this.proposedFundingLineRows.push(this.fundingLineToFundingData(fundingLine, true));
        });

        this.loadDataForTotalRevisedFunding();
      });
  }
  private loadDataForTotalRevisedFunding() {
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
    this.drawLineChart();
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

  async loadChart() {
    if (this.ufr.shortyType === ShortyType.PR) {
      await this.loadDataFromProgram();
    } else {
      await this.loadDataFromUfr();
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
      for (let i = this.pomYear; i < this.pomYear + 5; i++) {
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
      for (let i = this.pomYear; i < this.pomYear + 5; i++) {
        revisedFunds[i] = 0;
      }
    }
    for (let i = this.pomYear; i < this.pomYear + 5; i++) {
      data.push(['FY' + (i % 100), currentFunds[i] ?? 0, revisedFunds[i] ?? 0]);
    }
    return data;
  }

  changeEditMode(editMode: boolean) {
    this.editMode = editMode;

    if (editMode && this.ufr.ufrStatus === UFRStatus.SAVED) {
      this.form.get('justification').enable();
      this.form.get('impactN').enable();
      this.form.get('milestoneImpact').enable();
    } else {
      this.form.get('justification').disable();
      this.form.get('impactN').disable();
      this.form.get('milestoneImpact').disable();
    }
  }
}
