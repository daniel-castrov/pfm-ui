import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { FundingLine } from '../models/funding-line.model';
import { Injectable } from '@angular/core';
import { FundingLineType } from '../models/enumerations/funding-line-type.model';

@Injectable()
export abstract class FundingLineService extends BaseRestService {
  abstract obtainFundingLineById(fundingLineId: string): Observable<any>;
  abstract obtainFundingLinesByContainerId(containerId: string, fundingLineType: FundingLineType): Observable<any>;
  abstract createFundingLine(fundingLine: FundingLine): Observable<any>;
  abstract createFundingLineToUfr(fundingLine: FundingLine): Observable<any>;
  abstract updateFundingLine(fundingLine: FundingLine): Observable<any>;
  abstract updateFundingLineToUfr(fundingLine: FundingLine): Observable<any>;
  abstract updateFundingLineBulk(fundingLines: FundingLine[], amount: number, isPercentage: boolean): Observable<any>;
  abstract removeFundingLineById(fundingLineId: string): Observable<any>;
  abstract removeFundingLineByIdForUfr(fundingLineId: string): Observable<any>;
  abstract getByProgramContainerIds(programContainerIds: string[]): Observable<any>;
}
