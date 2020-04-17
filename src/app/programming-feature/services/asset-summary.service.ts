import { BaseRestService } from 'src/app/services/base-rest.service';
import { Observable } from 'rxjs';
import { AssetSummary } from '../models/asset-summary.model';

export abstract class AssetSummaryService extends BaseRestService {
  abstract obtainAssetSummariesByAssetId(assetId: string): Observable<any>;
  abstract createAssetSummary(assetSummary: AssetSummary, pomYear: number): Observable<any>;
  abstract updateAssetSummary(assetSummary: AssetSummary, pomYear: number): Observable<any>;
  abstract removeAssetSummaryById(assetSummaryId: string): Observable<any>;
}
