import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AssetSummary } from '../models/asset-summary.model';
import { AssetSummaryService } from './asset-summary.service';

@Injectable({
  providedIn: 'root'
})
export class AssetSummaryServiceImpl extends AssetSummaryService {
  obtainAssetSummariesByAssetId(assetId: string): Observable<any> {
    return this.get('asset-summary/asset/' + assetId);
  }

  createAssetSummary(assetSummary: AssetSummary, pomYear: number): Observable<any> {
    return this.post('asset-summary/pom-year/' + pomYear, assetSummary);
  }

  updateAssetSummary(assetSummary: AssetSummary, pomYear: number): Observable<any> {
    return this.put('asset-summary/pom-year/' + pomYear, assetSummary);
  }

  removeAssetSummaryById(assetSummaryId: string): Observable<any> {
    return this.delete('asset-summary/' + assetSummaryId);
  }
}
