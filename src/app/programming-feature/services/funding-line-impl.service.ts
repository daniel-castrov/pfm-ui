import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FundingLineService } from './funding-line.service';
import { FundingLine } from '../models/funding-line.model';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FundingLineServiceImpl extends FundingLineService {
  obtainFundingLineById(fundingLineId: string): Observable<any> {
    return this.get('funding-line/' + fundingLineId);
  }

  obtainFundingLinesByProgramId(programId: string): Observable<any> {
    return this.get('funding-line/program/' + programId);
  }

  createFundingLine(fundingLine: FundingLine): Observable<any> {
    return this.post('funding-line', fundingLine);
  }

  updateFundingLine(fundingLine: FundingLine): Observable<any> {
    return this.put('funding-line', fundingLine);
  }

  removeFundingLineById(fundingLineId: string): Observable<any> {
    return this.delete('funding-line/' + fundingLineId);
  }

  getByProgramContainerIds(programContainerIds: string[]): Observable<any> {
    return this.get(
      'funding-line/program/container/ids',
      new HttpParams().set('programContainerIds', programContainerIds.join(','))
    );
  }
}
