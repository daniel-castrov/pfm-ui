import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';
import { AssetSummary } from '../models/asset-summary.model';
import { Injectable } from '@angular/core';

@Injectable()
export abstract class AssetSummaryService extends BaseRestService {
  abstract obtainAssetSummariesByAssetId(assetId: string): Observable<any>;
  abstract createAssetSummary(assetSummary: AssetSummary): Observable<any>;
  abstract updateAssetSummary(assetSummary: AssetSummary): Observable<any>;
  abstract removeAssetSummaryById(assetSummaryId: string): Observable<any>;
}
