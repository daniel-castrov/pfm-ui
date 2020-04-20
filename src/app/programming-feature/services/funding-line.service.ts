import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { FundingLine } from '../models/funding-line.model';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class FundingLineService extends BaseRestService {
  abstract obtainFundingLineById(fundingLineId: string): Observable<any>;
  abstract obtainFundingLinesByProgramId(programId: string): Observable<any>;
  abstract createFundingLine(fundingLine: FundingLine): Observable<any>;
  abstract updateFundingLine(fundingLine: FundingLine): Observable<any>;
  abstract removeFundingLineById(fundingLineId: string): Observable<any>;
}
