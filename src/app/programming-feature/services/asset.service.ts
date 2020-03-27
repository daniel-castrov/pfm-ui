import { Observable } from 'rxjs';
import { BaseRestService } from '../../services/base-rest.service';
import { Asset } from '../models/asset.model';

export abstract class AssetService extends BaseRestService {

  abstract obtainAssetByFundingLineId(fundingLineId: string): Observable<any>;
  abstract createAsset(asset: Asset): Observable<any>;
  abstract updateAsset(asset: Asset): Observable<any>;
  abstract removeAssetById(assetId: string): Observable<any>;

}
