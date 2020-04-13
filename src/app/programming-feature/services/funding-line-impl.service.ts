import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FundingLineService } from './funding-line.service';
import { FundingLine } from '../models/funding-line.model';

@Injectable({
  providedIn: 'root'
})
export class FundingLineServiceImpl extends FundingLineService {
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
}
