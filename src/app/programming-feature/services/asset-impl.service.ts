import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Asset } from '../models/asset.model';
import { AssetService } from './asset.service';

@Injectable({
  providedIn: 'root'
})
export class AssetServiceImpl extends AssetService {
  obtainAssetByFundingLineId(fundingLineId: string): Observable<any> {
    return this.get('assets/funding-line/' + fundingLineId);
  }

  createAsset(asset: Asset): Observable<any> {
    return this.post('assets', asset);
  }

  updateAsset(asset: Asset): Observable<any> {
    return this.put('assets', asset);
  }

  removeAssetById(assetId: string): Observable<any> {
    return this.delete('assets/' + assetId);
  }
}
