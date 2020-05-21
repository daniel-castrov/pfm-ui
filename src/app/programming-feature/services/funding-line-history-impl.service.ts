import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { FundingLineHistoryService } from './funding-line-history.service';
import { FundingLineHistory } from '../models/funding-line-history.model';

@Injectable({
  providedIn: 'root'
})
export class FundingLineHistoryServiceImpl extends FundingLineHistoryService {
  getFundingLineHistoriesByProgramId(programId: string): Observable<any> {
    return this.get('funding-line-history/program/' + programId);
  }

  createFundingLineHistory(fundingLineHistory: FundingLineHistory): Observable<any> {
    return this.post('funding-line-history', fundingLineHistory);
  }

  deleteFundingLineHistory(fundingLineId: string): Observable<any> {
    return this.delete('funding-line-history/' + fundingLineId);
  }
}
