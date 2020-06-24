import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { Injectable } from '@angular/core';
import { FundingLineHistory } from '../models/funding-line-history.model';

@Injectable()
export abstract class FundingLineHistoryService extends BaseRestService {
  abstract getFundingLineHistoriesByProgramId(programId: string): Observable<any>;
  abstract createFundingLineHistory(fundingLineHistory: FundingLineHistory): Observable<any>;
  abstract deleteFundingLineHistory(fundingLineId: string): Observable<any>;
}
