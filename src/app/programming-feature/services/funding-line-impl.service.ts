import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FundingLineService } from './funding-line.service';
import { FundingLine } from '../models/funding-line.model';
import { HttpParams } from '@angular/common/http';
import { FundingLineType } from '../models/enumerations/funding-line-type.model';

@Injectable({
  providedIn: 'root'
})
export class FundingLineServiceImpl extends FundingLineService {
  obtainFundingLineById(fundingLineId: string): Observable<any> {
    return this.get('funding-line/' + fundingLineId);
  }

  obtainFundingLinesByContainerId(containerId: string, fundingLineType: FundingLineType): Observable<any> {
    return this.get('funding-line/container/' + containerId + '/funding-line-type/' + fundingLineType);
  }

  createFundingLine(fundingLine: FundingLine): Observable<any> {
    return this.post('funding-line', fundingLine);
  }

  createFundingLineToUfr(fundingLine: FundingLine): Observable<any> {
    return this.post('funding-line/ufr', fundingLine);
  }

  updateFundingLine(fundingLine: FundingLine): Observable<any> {
    return this.put('funding-line', fundingLine);
  }

  updateFundingLineToUfr(fundingLine: FundingLine): Observable<any> {
    return this.put('funding-line/ufr', fundingLine);
  }

  updateFundingLineBulk(fundingLines: FundingLine[], amount: number, isPercentage: boolean): Observable<any> {
    return this.put('funding-line/bulk/' + amount + '/' + isPercentage, fundingLines);
  }

  removeFundingLineById(fundingLineId: string): Observable<any> {
    return this.delete('funding-line/' + fundingLineId);
  }

  removeFundingLineByIdForUfr(fundingLineId: string): Observable<any> {
    return this.delete('funding-line/ufr/' + fundingLineId);
  }

  getByProgramContainerIds(programContainerIds: string[]): Observable<any> {
    return this.get(
      'funding-line/program/container/ids',
      new HttpParams().set('programContainerIds', programContainerIds.join(','))
    );
  }
}
